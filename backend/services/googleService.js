// backend/services/googleService.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// Configurar estratégia do Google OAuth
const configureGoogleAuth = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
                scope: ['profile', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log('🔐 Autenticando com Google:', profile.emails[0].value);

                    // Buscar ou criar usuário
                    const email = profile.emails[0].value;
                    const nome = profile.displayName;
                    const googleId = profile.id;
                    const foto = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

                    let usuario = await prisma.usuario.findUnique({
                        where: { email: email }
                    });

                    if (!usuario) {
                        // Criar novo usuário
                        usuario = await prisma.usuario.create({
                            data: {
                                nome: nome,
                                email: email,
                                googleId: googleId,
                                fotoPerfil: foto,
                                verificado: true // Google já verificou o email
                            }
                        });
                        console.log('🆕 Novo usuário criado via Google:', email);
                    } else if (!usuario.googleId) {
                        // Atualizar usuário existente com Google ID
                        usuario = await prisma.usuario.update({
                            where: { email: email },
                            data: {
                                googleId: googleId,
                                fotoPerfil: foto || usuario.fotoPerfil,
                                verificado: true
                            }
                        });
                        console.log('🔄 Usuário atualizado com Google ID:', email);
                    }

                    done(null, usuario);
                } catch (error) {
                    console.error('❌ Erro na autenticação Google:', error);
                    done(error, null);
                }
            }
        )
    );

    // Serializar usuário
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserializar usuário
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.usuario.findUnique({
                where: { id: id }
            });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

/**
 * Gerar URL de autenticação Google
 */
const getGoogleAuthUrl = () => {
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        throw new Error('GOOGLE_CLIENT_ID não configurado');
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: redirectUri,
        client_id: clientId,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' ')
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
};

/**
 * Processar callback do Google e gerar token JWT
 */
const handleGoogleCallback = async (code) => {
    try {
        // Trocar código por tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Obter informações do usuário
        const { data } = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name, sub: googleId, picture } = data;

        // Buscar ou criar usuário
        let usuario = await prisma.usuario.findUnique({
            where: { email: email }
        });

        if (!usuario) {
            usuario = await prisma.usuario.create({
                data: {
                    nome: name,
                    email: email,
                    googleId: googleId,
                    fotoPerfil: picture,
                    verificado: true
                }
            });
        } else if (!usuario.googleId) {
            usuario = await prisma.usuario.update({
                where: { email: email },
                data: {
                    googleId: googleId,
                    fotoPerfil: picture || usuario.fotoPerfil,
                    verificado: true
                }
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            sucesso: true,
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                fotoPerfil: usuario.fotoPerfil
            }
        };
    } catch (error) {
        console.error('❌ Erro no callback Google:', error);
        throw error;
    }
};

module.exports = {
    configureGoogleAuth,
    getGoogleAuthUrl,
    handleGoogleCallback
};
