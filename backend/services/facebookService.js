// services/facebookService.js
const axios = require('axios');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

class FacebookService {
  constructor() {
    this.graphApiUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * 1. TROCAR AUTHORIZATION CODE POR ACCESS TOKEN
   * Backend → Facebook: Trocar código por token
   */
  async exchangeCodeForToken(code, redirectUri) {
    try {
      const params = {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: redirectUri,
        code: code
      };

      console.log('🔄 Trocando código por access token...');
      
      const response = await axios.get(`${this.graphApiUrl}/oauth/access_token`, { 
        params 
      });

      if (response.data.access_token) {
        console.log('✅ Access token obtido com sucesso');
        return {
          success: true,
          access_token: response.data.access_token,
          expires_in: response.data.expires_in
        };
      }

      throw new Error('Access token não retornado pelo Facebook');

    } catch (error) {
      console.error('❌ Erro ao trocar código por token:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Erro ao obter access token'
      };
    }
  }

  /**
   * 2. BUSCAR DADOS DO USUÁRIO NO FACEBOOK
   * Backend → Facebook Graph API: Buscar perfil
   */
  async getUserProfile(accessToken) {
    try {
      console.log('👤 Buscando perfil do usuário no Facebook...');
      
      const response = await axios.get(`${this.graphApiUrl}/me`, {
        params: {
          fields: 'id,name,email,picture.type(large)',
          access_token: accessToken
        }
      });

      const userData = response.data;
      
      console.log('✅ Dados do usuário obtidos:', userData.name, userData.email);

      return {
        success: true,
        user: {
          facebook_id: userData.id,
          nome: userData.name,
          email: userData.email,
          avatar_url: userData.picture?.data?.url || null
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Erro ao buscar dados do usuário'
      };
    }
  }

  /**
   * 3. AUTENTICAR OU CRIAR USUÁRIO
   * Backend → Banco: Buscar/criar usuário e gerar JWT
   */
  async authenticateUser(facebookUser, accessToken) {
    try {
      if (!prisma) {
        // Fallback para servidor sem banco
        return this.authenticateUserMemory(facebookUser, accessToken);
      }

      const { facebook_id, nome, email, avatar_url } = facebookUser;

      console.log('🔍 Verificando se usuário existe...');

      // 1. Tentar encontrar por facebook_id
      let usuario = await prisma.usuario.findUnique({
        where: { facebook_id }
      });

      // 2. Se não existe, tentar por email (se tiver)
      if (!usuario && email) {
        usuario = await prisma.usuario.findUnique({
          where: { email }
        });

        // Se encontrou por email, vincular facebook_id
        if (usuario) {
          usuario = await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              facebook_id,
              avatar_url,
              provider: 'facebook',
              facebook_access_token: accessToken,
              ultimo_login: new Date()
            }
          });
          console.log('🔗 Facebook vinculado a conta existente');
        }
      }

      // 3. Se não existe, criar novo usuário
      if (!usuario) {
        usuario = await prisma.usuario.create({
          data: {
            nome,
            email: email || null,
            facebook_id,
            avatar_url,
            provider: 'facebook',
            facebook_access_token: accessToken,
            email_verificado: email ? true : false,
            ativo: true,
            ultimo_login: new Date()
          }
        });
        console.log('🆕 Novo usuário criado via Facebook:', nome);
      } else {
        // Atualizar último login
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { ultimo_login: new Date() }
        });
        console.log('🔐 Login realizado:', usuario.nome);
      }

      // 4. Gerar JWT
      const token = this.generateJWT(usuario);

      return {
        success: true,
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          avatar_url: usuario.avatar_url,
          provider: usuario.provider,
          email_verificado: usuario.email_verificado
        },
        token,
        isNewUser: !usuario.ultimo_login
      };

    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      throw error;
    }
  }

  /**
   * 4. FALLBACK PARA SERVIDOR SEM BANCO (ACADÊMICO)
   */
  authenticateUserMemory(facebookUser, accessToken) {
    // Para demonstração sem banco de dados
    const usuario = {
      id: Date.now(),
      nome: facebookUser.nome,
      email: facebookUser.email,
      avatar_url: facebookUser.avatar_url,
      facebook_id: facebookUser.facebook_id,
      provider: 'facebook',
      email_verificado: true,
      ultimo_login: new Date().toISOString()
    };

    const token = this.generateJWT(usuario);

    console.log('🎓 Usuário autenticado (modo acadêmico):', usuario.nome);

    return {
      success: true,
      user: usuario,
      token,
      isNewUser: true
    };
  }

  /**
   * 5. GERAR JWT TOKEN
   */
  generateJWT(user) {
    const payload = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      provider: user.provider || 'facebook'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'secret_key_facebook', {
      expiresIn: '7d'
    });
  }

  /**
   * 6. VALIDAR ACCESS TOKEN DO FACEBOOK
   */
  async validateFacebookToken(accessToken) {
    try {
      const response = await axios.get(`${this.graphApiUrl}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name'
        }
      });

      return {
        valid: true,
        facebook_id: response.data.id,
        name: response.data.name
      };
    } catch (error) {
      console.error('❌ Token inválido:', error.response?.data || error.message);
      return {
        valid: false,
        error: 'Token inválido ou expirado'
      };
    }
  }

  /**
   * 7. FLUXO COMPLETO DE LOGIN
   */
  async completeLogin(authorizationCode, redirectUri) {
    try {
      console.log('🚀 Iniciando fluxo de login Facebook...');
      
      // 1. Trocar código por access token
      const tokenResult = await this.exchangeCodeForToken(authorizationCode, redirectUri);
      if (!tokenResult.success) {
        throw new Error(tokenResult.error);
      }

      // 2. Buscar dados do usuário
      const profileResult = await this.getUserProfile(tokenResult.access_token);
      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      // 3. Autenticar/criar usuário
      const authResult = await this.authenticateUser(
        profileResult.user, 
        tokenResult.access_token
      );

      console.log('✅ Login Facebook concluído com sucesso!');

      return {
        success: true,
        ...authResult
      };

    } catch (error) {
      console.error('❌ Erro no fluxo de login Facebook:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new FacebookService();