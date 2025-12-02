// services/usuarioService.js

const prisma = require('../config/database');
const emailService = require('./emailService');

class UsuarioService {
  
  /**
   * Gerar código de verificação de 6 dígitos
   */
  gerarCodigoVerificacao() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 1. CADASTRAR USUÁRIO (sem senha)
   * Similar ao iFood - apenas nome e email/telefone
   */
  async cadastrarUsuario(dados) {
    try {
      // Verificar se o Prisma está disponível
      if (!prisma) {
        throw new Error('Banco de dados não está disponível. Configure o PostgreSQL ou use o servidor acadêmico.');
      }

      const { nome, email, telefone } = dados;

      // Validações básicas
      if (!nome) {
        throw new Error('Nome é obrigatório');
      }

      if (!email && !telefone) {
        throw new Error('Email ou telefone é obrigatório');
      }

      // Verificar se já existe
      let usuarioExistente = null;
      if (email) {
        usuarioExistente = await prisma.usuario.findUnique({
          where: { email }
        });
      }
      if (!usuarioExistente && telefone) {
        usuarioExistente = await prisma.usuario.findUnique({
          where: { telefone }
        });
      }

      if (usuarioExistente) {
        throw new Error('Usuário já cadastrado com este email ou telefone');
      }

      // Criar usuário
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome: nome.trim(),
          email: email || null,
          telefone: telefone || null,
          email_verificado: false,
          telefone_verificado: false,
          ativo: true
        }
      });

      console.log('👤 Usuário cadastrado:', novoUsuario.nome, '-', email || telefone);

      return {
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso! Faça o login para verificar sua conta.',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          telefone: novoUsuario.telefone
        }
      };

    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  /**
   * 2. ENVIAR CÓDIGO DE VERIFICAÇÃO POR EMAIL
   * Similar ao iFood quando você faz login
   */
  async enviarCodigoEmail(email) {
    try {
      if (!email) {
        throw new Error('Email é obrigatório');
      }

      // Buscar usuário
      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        // Criar usuário automaticamente se não existir (padrão iFood)
        const novoUsuario = await prisma.usuario.create({
          data: {
            nome: `Usuário ${email.split('@')[0]}`,
            email,
            email_verificado: false,
            ativo: true
          }
        });
        console.log('👤 Usuário criado automaticamente:', novoUsuario.nome);
      }

      // Gerar código e salvar
      const codigo = this.gerarCodigoVerificacao();
      const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      await prisma.usuario.update({
        where: { email },
        data: {
          codigo_verificacao: codigo,
          codigo_expira_em: expiraEm
        }
      });

      // Simular envio de email (acadêmico)
      console.log('📧 CÓDIGO DE VERIFICAÇÃO POR EMAIL');
      console.log(`Email: ${email}`);
      console.log(`Código: ${codigo}`);
      console.log(`Expira em: ${expiraEm.toLocaleTimeString()}`);
      console.log('─'.repeat(50));

      return {
        sucesso: true,
        mensagem: 'Código enviado por email',
        codigoParaTeste: codigo // Para facilitar testes acadêmicos
      };

    } catch (error) {
      console.error('Erro ao enviar código por email:', error);
      throw error;
    }
  }

  /**
   * 3. ENVIAR CÓDIGO DE VERIFICAÇÃO POR SMS
   * Similar ao iFood para verificação por celular
   */
  async enviarCodigoSMS(telefone) {
    try {
      if (!telefone) {
        throw new Error('Telefone é obrigatório');
      }

      // Buscar usuário
      let usuario = await prisma.usuario.findUnique({
        where: { telefone }
      });

      if (!usuario) {
        // Criar usuário automaticamente se não existir
        usuario = await prisma.usuario.create({
          data: {
            nome: `Usuário ${telefone}`,
            telefone,
            telefone_verificado: false,
            ativo: true
          }
        });
        console.log('👤 Usuário criado automaticamente:', usuario.nome);
      }

      // Gerar código e salvar
      const codigo = this.gerarCodigoVerificacao();
      const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      await prisma.usuario.update({
        where: { telefone },
        data: {
          codigo_verificacao: codigo,
          codigo_expira_em: expiraEm
        }
      });

      // Simular envio de SMS (acadêmico)
      console.log('📱 CÓDIGO DE VERIFICAÇÃO POR SMS');
      console.log(`Telefone: ${telefone}`);
      console.log(`Código: ${codigo}`);
      console.log(`Expira em: ${expiraEm.toLocaleTimeString()}`);
      console.log('─'.repeat(50));

      return {
        sucesso: true,
        mensagem: 'Código enviado por SMS',
        codigoParaTeste: codigo // Para facilitar testes acadêmicos
      };

    } catch (error) {
      console.error('Erro ao enviar código por SMS:', error);
      throw error;
    }
  }

  /**
   * 4. VERIFICAR CÓDIGO E FAZER LOGIN
   * Similar ao iFood quando você digita o código
   */
  async verificarCodigoELogin(identificador, codigo) {
    try {
      if (!identificador || !codigo) {
        throw new Error('Identificador (email/telefone) e código são obrigatórios');
      }

      // Buscar usuário por email ou telefone
      let usuario = null;
      if (identificador.includes('@')) {
        usuario = await prisma.usuario.findUnique({
          where: { email: identificador }
        });
      } else {
        usuario = await prisma.usuario.findUnique({
          where: { telefone: identificador }
        });
      }

      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      if (!usuario.ativo) {
        throw new Error('Conta desativada');
      }

      // Verificar código
      if (!usuario.codigo_verificacao || 
          usuario.codigo_verificacao !== codigo ||
          !usuario.codigo_expira_em ||
          new Date() > usuario.codigo_expira_em) {
        throw new Error('Código inválido ou expirado');
      }

      // Marcar como verificado e fazer login
      const dadosAtualizacao = {
        codigo_verificacao: null,
        codigo_expira_em: null,
        ultimo_login: new Date()
      };

      if (identificador.includes('@')) {
        dadosAtualizacao.email_verificado = true;
      } else {
        dadosAtualizacao.telefone_verificado = true;
      }

      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: dadosAtualizacao,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          email_verificado: true,
          telefone_verificado: true,
          data_criacao: true,
          ultimo_login: true
        }
      });

      console.log('✅ Login realizado:', usuarioAtualizado.nome, '-', identificador);

      return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        token: `token_${usuarioAtualizado.id}_${Date.now()}`, // Token simples para acadêmico
        usuario: usuarioAtualizado
      };

    } catch (error) {
      console.error('Erro na verificação:', error);
      throw error;
    }
  }

  /**
   * 5. ATUALIZAR DADOS DO USUÁRIO
   */
  async atualizarUsuario(id, dados) {
    try {
      const { nome, email, telefone } = dados;

      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      });

      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se email/telefone já existem em outros usuários
      if (email && email !== usuario.email) {
        const emailExistente = await prisma.usuario.findUnique({
          where: { email }
        });
        if (emailExistente) {
          throw new Error('Email já está em uso por outro usuário');
        }
      }

      if (telefone && telefone !== usuario.telefone) {
        const telefoneExistente = await prisma.usuario.findUnique({
          where: { telefone }
        });
        if (telefoneExistente) {
          throw new Error('Telefone já está em uso por outro usuário');
        }
      }

      // Atualizar dados
      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: {
          nome: nome || usuario.nome,
          email: email || usuario.email,
          telefone: telefone || usuario.telefone,
          // Marcar como não verificado se mudou email/telefone
          email_verificado: email && email !== usuario.email ? false : usuario.email_verificado,
          telefone_verificado: telefone && telefone !== usuario.telefone ? false : usuario.telefone_verificado
        },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          email_verificado: true,
          telefone_verificado: true,
          data_criacao: true,
          ultimo_login: true
        }
      });

      console.log('✅ Usuário atualizado:', usuarioAtualizado.nome);

      return {
        sucesso: true,
        mensagem: 'Usuário atualizado com sucesso',
        usuario: usuarioAtualizado
      };

    } catch (error) {
      console.error('Erro na atualização:', error);
      throw error;
    }
  }

  /**
   * 6. LISTAR USUÁRIOS
   */
  async listarUsuarios() {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: { ativo: true },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          email_verificado: true,
          telefone_verificado: true,
          data_criacao: true,
          ultimo_login: true
        },
        orderBy: { data_criacao: 'desc' }
      });

      return {
        sucesso: true,
        total: usuarios.length,
        usuarios
      };

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * 7. DESATIVAR USUÁRIO (SOFT DELETE)
   */
  async desativarUsuario(id) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      });

      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { ativo: false }
      });

      console.log('🗑️ Usuário desativado:', usuario.nome);

      return {
        sucesso: true,
        mensagem: 'Usuário desativado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  /**
   * 8. BUSCAR USUÁRIO POR ID
   */
  async buscarUsuarioPorId(id) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          email_verificado: true,
          telefone_verificado: true,
          ativo: true,
          data_criacao: true,
          ultimo_login: true
        }
      });

      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      return {
        sucesso: true,
        usuario
      };

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }
}

module.exports = new UsuarioService();