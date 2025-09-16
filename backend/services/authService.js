const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const logger = require('../config/logger');
const tokenManager = require('../utils/tokenManager');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const { 
  generateVerificationCode, 
  generateSecureToken, 
  minutesToMs, 
  hoursToMs,
  daysToMs,
  validateCPF,
  formatCPF 
} = require('../utils/helpers');
const { setCache, getCache, deleteCache } = require('../config/redis');

class AuthService {
  /**
   * Envia código de verificação por email
   */
  async sendVerificationCode(email) {
    try {
      // Verifica se já existe um usuário
      let user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true, name: true, verificationCode: true, verificationCodeExpiry: true }
      });

      // Gera novo código de verificação (8 dígitos)
      const code = generateVerificationCode(8);
      const expiresAt = new Date(Date.now() + minutesToMs(10)); // 10 minutos

      if (!user) {
        // Cria novo usuário
        user = await prisma.user.create({
          data: { 
            email, 
            verificationCode: code,
            verificationCodeExpiry: expiresAt,
            verificationAttempts: 0
          }
        });
      } else {
        // Atualiza código do usuário existente
        user = await prisma.user.update({
          where: { email },
          data: { 
            verificationCode: code,
            verificationCodeExpiry: expiresAt,
            verificationAttempts: 0
          }
        });
      }

      // Cache do código para validação rápida
      await setCache(`verification:${email}:${code}`, true, 600); // 10 minutos

      // Envia email
      await emailService.sendVerificationEmail(email, code, user.name);

      logger.info('Verification code sent', { email, userId: user.id });

      return {
        success: true,
        message: 'Código de verificação enviado para o email informado!'
      };

    } catch (error) {
      logger.error('Error sending verification code:', { email, error: error.message });
      throw new Error('Falha ao enviar código de verificação');
    }
  }

  /**
   * Verifica código de verificação
   */
  async verifyCode(email, code) {
    try {
      const user = await prisma.user.findUnique({ 
        where: { email },
        select: { 
          id: true, 
          verificationCode: true, 
          verificationCodeExpiry: true, 
          verificationAttempts: true,
          emailVerified: true,
          isActive: true
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (!user.isActive) {
        throw new Error('Conta desativada');
      }

      // Verifica tentativas
      if (user.verificationAttempts >= 3) {
        throw new Error('Muitas tentativas. Solicite um novo código.');
      }

      // Verifica expiração
      if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
        throw new Error('Código expirado. Solicite um novo código.');
      }

      // Verifica código
      if (!user.verificationCode || user.verificationCode !== code) {
        // Incrementa tentativas
        await prisma.user.update({
          where: { email },
          data: { verificationAttempts: user.verificationAttempts + 1 }
        });
        throw new Error('Código inválido');
      }

      // Verifica cache (dupla verificação)
      const cached = await getCache(`verification:${email}:${code}`);
      if (!cached) {
        throw new Error('Código inválido ou expirado');
      }

      // Marca email como verificado
      await prisma.user.update({
        where: { email },
        data: { 
          emailVerified: true, 
          verificationCode: null,
          verificationCodeExpiry: null,
          verificationAttempts: 0
        }
      });

      // Remove do cache
      await deleteCache(`verification:${email}:${code}`);

      logger.info('Email verified successfully', { email, userId: user.id });

      return {
        success: true,
        message: 'Email verificado com sucesso!'
      };

    } catch (error) {
      logger.error('Error verifying code:', { email, error: error.message });
      throw error;
    }
  }

  /**
   * Completa o registro do usuário
   */
  async completeRegistration(email, name, cpf, password) {
    try {
      const user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true, emailVerified: true, isActive: true, name: true }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (!user.emailVerified) {
        throw new Error('Email não verificado');
      }

      if (!user.isActive) {
        throw new Error('Conta desativada');
      }

      // Valida CPF
      if (!validateCPF(cpf)) {
        throw new Error('CPF inválido');
      }

      // Verifica se CPF já está em uso
      const existingCpf = await prisma.user.findUnique({ 
        where: { cpf: cpf.replace(/[^\d]/g, '') }
      });

      if (existingCpf && existingCpf.id !== user.id) {
        throw new Error('CPF já está cadastrado');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12);

      // Atualiza usuário
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { 
          name: name.trim(),
          cpf: cpf.replace(/[^\d]/g, ''), // Remove formatação
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          name: true,
          cpf: true,
          role: true,
          createdAt: true
        }
      });

      // Envia email de boas-vindas
      await emailService.sendWelcomeEmail(email, name);

      // Registra histórico de login
      await this.recordLoginHistory(updatedUser.id, 'registration_completed', true);

      logger.info('User registration completed', { 
        email, 
        userId: updatedUser.id,
        name: name.trim()
      });

      return {
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: {
          ...updatedUser,
          cpf: formatCPF(updatedUser.cpf)
        }
      };

    } catch (error) {
      logger.error('Error completing registration:', { email, error: error.message });
      throw error;
    }
  }

  /**
   * Login do usuário
   */
  async login(email, password, ipAddress, userAgent) {
    try {
      const user = await prisma.user.findUnique({ 
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          emailVerified: true,
          isActive: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          lastLogin: true
        }
      });

      if (!user) {
        await this.recordLoginHistory(null, 'user_not_found', false, ipAddress, userAgent);
        throw new Error('Credenciais inválidas');
      }

      if (!user.isActive) {
        await this.recordLoginHistory(user.id, 'account_disabled', false, ipAddress, userAgent);
        throw new Error('Conta desativada');
      }

      if (!user.emailVerified) {
        await this.recordLoginHistory(user.id, 'email_not_verified', false, ipAddress, userAgent);
        throw new Error('Email não verificado');
      }

      // Verifica se a conta está bloqueada
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const timeRemaining = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
        await this.recordLoginHistory(user.id, 'account_locked', false, ipAddress, userAgent);
        throw new Error(`Conta bloqueada. Tente novamente em ${timeRemaining} minutos.`);
      }

      // Verifica senha
      if (!user.password || !await bcrypt.compare(password, user.password)) {
        const newFailedAttempts = user.failedLoginAttempts + 1;
        const lockAccount = newFailedAttempts >= 5;
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            ...(lockAccount && { 
              lockedUntil: new Date(Date.now() + minutesToMs(30)) // Bloqueia por 30 minutos
            })
          }
        });

        await this.recordLoginHistory(user.id, 'invalid_password', false, ipAddress, userAgent);
        
        if (lockAccount) {
          throw new Error('Muitas tentativas de login. Conta bloqueada por 30 minutos.');
        }
        
        throw new Error('Credenciais inválidas');
      }

      // Login bem-sucedido - reseta contadores
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date()
        }
      });

      // Gera tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = tokenManager.generateAccessToken(tokenPayload);
      const refreshToken = tokenManager.generateRefreshToken(tokenPayload);

      // Salva sessão
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + daysToMs(7)), // 7 dias
          ipAddress,
          userAgent
        }
      });

      // Registra histórico
      await this.recordLoginHistory(user.id, 'login_success', true, ipAddress, userAgent);

      // Detecta login suspeito (opcional)
      await this.detectSuspiciousLogin(user, ipAddress, userAgent);

      logger.info('User logged in successfully', { 
        email, 
        userId: user.id,
        ipAddress,
        sessionId: session.id
      });

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };

    } catch (error) {
      logger.error('Error during login:', { email, ipAddress, error: error.message });
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // Verifica token
      const payload = tokenManager.verifyRefreshToken(refreshToken);

      // Busca sessão
      const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true }
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        throw new Error('Sessão inválida ou expirada');
      }

      if (!session.user.isActive || !session.user.emailVerified) {
        throw new Error('Usuário inativo');
      }

      // Gera novo access token
      const newAccessToken = tokenManager.generateAccessToken({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role
      });

      logger.info('Token refreshed successfully', { 
        userId: session.user.id,
        sessionId: session.id
      });

      return {
        success: true,
        accessToken: newAccessToken
      };

    } catch (error) {
      logger.error('Error refreshing token:', { error: error.message });
      throw new Error('Token inválido');
    }
  }

  /**
   * Logout
   */
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await prisma.session.updateMany({
          where: { refreshToken },
          data: { isActive: false }
        });
      }

      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };

    } catch (error) {
      logger.error('Error during logout:', { error: error.message });
      throw new Error('Erro ao fazer logout');
    }
  }

  /**
   * Registra histórico de login
   */
  async recordLoginHistory(userId, reason, success, ipAddress = null, userAgent = null) {
    try {
      if (!userId) return; // Não registra se não há usuário

      await prisma.loginHistory.create({
        data: {
          userId,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          success,
          reason
        }
      });
    } catch (error) {
      logger.error('Error recording login history:', error);
    }
  }

  /**
   * Detecta login suspeito
   */
  async detectSuspiciousLogin(user, ipAddress, userAgent) {
    try {
      // Busca últimos logins bem-sucedidos
      const recentLogins = await prisma.loginHistory.findMany({
        where: {
          userId: user.id,
          success: true,
          createdAt: {
            gte: new Date(Date.now() - daysToMs(30)) // Últimos 30 dias
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Se for o primeiro login, não é suspeito
      if (recentLogins.length === 0) return;

      // Verifica se IP é conhecido
      const knownIps = recentLogins.map(login => login.ipAddress);
      const isNewIp = !knownIps.includes(ipAddress);

      // Verifica se device/browser é conhecido
      const knownUserAgents = recentLogins.map(login => login.userAgent);
      const isNewDevice = !knownUserAgents.some(ua => 
        ua && userAgent && ua.includes(userAgent.split(' ')[0])
      );

      // Se for IP e device novos, envia notificação
      if (isNewIp && isNewDevice) {
        await emailService.sendSuspiciousLoginEmail(
          user.email,
          {
            ipAddress,
            userAgent,
            timestamp: new Date().toLocaleString('pt-BR')
          },
          user.name
        );

        logger.warn('Suspicious login detected', {
          userId: user.id,
          email: user.email,
          ipAddress,
          userAgent
        });
      }

    } catch (error) {
      logger.error('Error detecting suspicious login:', error);
    }
  }
}

module.exports = new AuthService();
