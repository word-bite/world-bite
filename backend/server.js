// server.js

// 1. Importar os módulos
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Importar o cliente do Prisma
const prisma = require('./config/database.js');


// Importar o serviço de email
const emailService = require('./services/emailService');

// Importar o serviço de SMS
const smsService = require('./services/smsService');

// Importar o serviço do Google
const googleService = require('./services/googleService');

// 🔑 IMPORTAÇÃO DAS ROTAS DE PRATOS
const pratoRoutes = require('./routes/pratos');

// 🔑 IMPORTAÇÃO DAS ROTAS DE PAGAMENTOS
const pagamentosRoutes = require('./routes/pagamentos');

// 🔑 IMPORTAÇÃO DAS ROTAS DE PEDIDOS
const pedidosRoutes = require('./routes/pedidos');

// 🔑 IMPORTAÇÃO DAS ROTAS DE RELATÓRIOS
const relatoriosRoutes = require('./routes/relatorios');

// 2. Configurar a aplicação Express e Nexmo
const app = express();
const PORT = process.env.PORT || 3000;


// Objeto para armazenar códigos de verificação temporariamente (NÃO usar em produção)
const verificationCodes = {};

// 3. Middlewares
app.use(cors());
app.use(express.json());

// Configurar sessão para Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'world-bite-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estratégia do Google
googleService.configureGoogleAuth();

// Rota de health check para testar se o backend está funcionando
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend World Bite funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 4. Testar a conexão com o Prisma (opcional, mas útil)
(async () => {
    try {
        if (prisma) {
            await prisma.$connect();
            console.log('✅ Conexão bem-sucedida com o PostgreSQL usando Prisma!');
        } else {
            console.log('⚠️  PostgreSQL não está disponível. As APIs funcionarão mas retornarão erro específico.');
        }
    } catch (err) {
        console.error('Erro na conexão com o banco de dados:', err);
    } finally {
        // Nada de desconectar o Prisma!
    }
})();

// =======================================================
// ROTAS DE USUÁRIOS - AUTENTICAÇÃO SEM SENHA
// =======================================================

// Função utilitária para gerar código de verificação
function gerarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 🆕 Cadastro de usuário
app.post('/api/usuarios/cadastro', async (req, res) => {
    try {
        const { nome, email, telefone } = req.body;

        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Nome é obrigatório'
            });
        }

        if (!email && !telefone) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Email ou telefone é obrigatório'
            });
        }

        // Verificar se usuário já existe
        const usuarioExistente = await prisma.usuario.findFirst({
            where: {
                OR: [
                    email ? { email: email } : {},
                    telefone ? { telefone: telefone } : {}
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                sucesso: false,
                erro: 'Usuário já cadastrado com este email ou telefone'
            });
        }

        // Criar novo usuário
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: nome.trim(),
                email: email || null,
                telefone: telefone || null,
                ativo: true
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                data_criacao: true
            }
        });

        console.log(`✅ Usuário cadastrado: ${nome} - ${email || telefone}`);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: novoUsuario
        });

    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 📧 Enviar código de verificação por email
app.post('/api/usuarios/codigo-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Email é obrigatório'
            });
        }

        // Buscar ou criar usuário
        let usuario = await prisma.usuario.findUnique({
            where: { email: email }
        });

        if (!usuario) {
            usuario = await prisma.usuario.create({
                data: {
                    nome: `Usuário ${email.split('@')[0]}`,
                    email: email,
                    ativo: true
                }
            });
            console.log(`🆕 Usuário criado automaticamente: ${email}`);
        }

        // Gerar código
        const codigo = gerarCodigo();
        const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Atualizar usuário com código
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                codigo_verificacao: codigo,
                codigo_expira_em: expiraEm
            }
        });

        // Enviar email de verificação
        const emailResult = await emailService.sendVerificationEmail(email, codigo, usuario.nome);
        
        if (!emailResult.success) {
            console.error('❌ Erro ao enviar email:', emailResult.error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao enviar email de verificação'
            });
        }

        console.log('📧 EMAIL DE VERIFICAÇÃO ENVIADO');
        console.log(`Email: ${email}`);
        console.log(`Message ID: ${emailResult.messageId}`);
        console.log('─'.repeat(50));

        res.json({
            sucesso: true,
            mensagem: 'Código de verificação enviado para seu email'
        });

    } catch (error) {
        console.error('❌ Erro ao enviar código por email:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 📱 Enviar código de verificação por SMS
app.post('/api/usuarios/codigo-sms', async (req, res) => {
    try {
        const { telefone } = req.body;

        if (!telefone) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Telefone é obrigatório'
            });
        }

        // Buscar ou criar usuário
        let usuario = await prisma.usuario.findUnique({
            where: { telefone: telefone }
        });

        if (!usuario) {
            usuario = await prisma.usuario.create({
                data: {
                    nome: `Usuário ${telefone}`,
                    telefone: telefone,
                    ativo: true
                }
            });
            console.log(`🆕 Usuário criado automaticamente: ${telefone}`);
        }

        // Gerar código
        const codigo = gerarCodigo();
        const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Atualizar usuário com código
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                codigo_verificacao: codigo,
                codigo_expira_em: expiraEm
            }
        });

        console.log('📱 CÓDIGO DE VERIFICAÇÃO POR SMS');
        console.log(`Telefone: ${telefone}`);
        console.log(`Código: ${codigo}`);
        console.log(`Expira: ${expiraEm.toLocaleString()}`);
        console.log('─'.repeat(50));

        // Enviar SMS real usando Vonage
        try {
            await smsService.enviarCodigoVerificacao(telefone, codigo);
            console.log('✅ SMS enviado com sucesso via Vonage');
        } catch (smsError) {
            console.error('⚠️ Erro ao enviar SMS, mas código foi salvo:', smsError);
            // Não retornar erro, pois o código foi salvo e pode ser usado em desenvolvimento
        }

        res.json({
            sucesso: true,
            mensagem: 'Código de verificação enviado por SMS',
            // Em desenvolvimento, retornar o código (REMOVER EM PRODUÇÃO)
            ...(process.env.NODE_ENV === 'development' && { codigo_dev: codigo })
        });

    } catch (error) {
        console.error('❌ Erro ao enviar código por SMS:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 🔐 Login com código de verificação
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { identificador, codigo } = req.body;

        if (!identificador || !codigo) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Identificador (email/telefone) e código são obrigatórios'
            });
        }

        // Buscar usuário por email ou telefone
        const usuario = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { email: identificador },
                    { telefone: identificador }
                ]
            }
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }

        if (!usuario.ativo) {
            return res.status(403).json({
                sucesso: false,
                erro: 'Conta desativada'
            });
        }

        // Verificar código
        if (!usuario.codigo_verificacao || 
            usuario.codigo_verificacao !== codigo ||
            !usuario.codigo_expira_em ||
            new Date() > usuario.codigo_expira_em) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Código inválido ou expirado'
            });
        }

        // Verificar se é a primeira verificação (para enviar email de boas-vindas)
        const isFirstVerification = !usuario.email_verificado && !usuario.telefone_verificado;

        // Atualizar usuário (limpar código e atualizar último login)
        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                codigo_verificacao: null,
                codigo_expira_em: null,
                ultimo_login: new Date(),
                email_verificado: identificador.includes('@') ? true : usuario.email_verificado,
                telefone_verificado: !identificador.includes('@') ? true : usuario.telefone_verificado
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                email_verificado: true,
                telefone_verificado: true,
                ultimo_login: true,
                avatar_url: true,
                provider: true
            }
        });

        // Enviar email de boas-vindas se for a primeira verificação e tiver email
        if (isFirstVerification && usuario.email) {
            try {
                await emailService.sendWelcomeEmail(usuario.email, usuario.nome);
                console.log(`📧 Email de boas-vindas enviado para: ${usuario.email}`);
            } catch (error) {
                console.error('❌ Erro ao enviar email de boas-vindas:', error);
                // Não falha o login por causa do email de boas-vindas
            }
        }

        console.log(`🔐 Login realizado: ${usuario.nome} (${identificador})`);

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token: `token_${usuario.id}_t${Date.now()}`, // Em produção, use JWT real
            usuario: usuarioAtualizado
        });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 📋 Listar usuários
app.get('/api/usuarios', async (req, res) => {
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
                ultimo_login: true,
                provider: true,
                avatar_url: true
            },
            orderBy: { data_criacao: 'desc' }
        });

        res.json({
            sucesso: true,
            total: usuarios.length,
            usuarios: usuarios
        });
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 🔍 Buscar usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                erro: 'ID inválido'
            });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { 
                id: id,
                ativo: true 
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                email_verificado: true,
                telefone_verificado: true,
                data_criacao: true,
                ultimo_login: true,
                provider: true,
                avatar_url: true
            }
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }

        res.json({
            sucesso: true,
            usuario: usuario
        });
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// ✏️ Atualizar usuário
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, telefone } = req.body;
        
        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                erro: 'ID inválido'
            });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { 
                id: id,
                ativo: true 
            }
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }

        const dadosAtualizacao = {};
        if (nome) dadosAtualizacao.nome = nome.trim();
        if (telefone) dadosAtualizacao.telefone = telefone;

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: id },
            data: dadosAtualizacao,
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true
            }
        });

        console.log(`📝 Usuário atualizado: ${usuarioAtualizado.nome} (ID: ${id})`);

        res.json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso',
            usuario: usuarioAtualizado
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 🗑️ Desativar usuário (soft delete)
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                erro: 'ID inválido'
            });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { 
                id: id,
                ativo: true 
            }
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }

        await prisma.usuario.update({
            where: { id: id },
            data: { ativo: false }
        });

        console.log(`🗑️ Usuário desativado: ${usuario.nome} (ID: ${id})`);

        res.json({
            sucesso: true,
            mensagem: 'Usuário desativado com sucesso'
        });
    } catch (error) {
        console.error('❌ Erro ao desativar usuário:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// =======================================================
// ROTAS DE FACEBOOK OAUTH 2.0
// =======================================================

// 🔗 Obter URL de login do Facebook
app.get('/api/auth/facebook/url', (req, res) => {
    try {
        const { redirect_uri } = req.query;

        if (!redirect_uri) {
            return res.status(400).json({
                sucesso: false,
                erro: 'redirect_uri é obrigatório'
            });
        }

        const facebookAppId = process.env.FACEBOOK_APP_ID || 'sua_app_id_facebook';
        const scope = 'email,public_profile';
        
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
            `client_id=${facebookAppId}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
            `scope=${scope}&` +
            `response_type=code&` +
            `state=worldbite_${Date.now()}`;

        console.log('🔗 URL de login Facebook gerada');

        res.json({
            sucesso: true,
            auth_url: authUrl,
            app_id: facebookAppId,
            redirect_uri: redirect_uri
        });

    } catch (error) {
        console.error('❌ Erro ao gerar URL Facebook:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 📱 Callback do Facebook OAuth
app.post('/api/auth/facebook/callback', async (req, res) => {
    try {
        const { code, redirect_uri } = req.body;

        if (!code || !redirect_uri) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Código e redirect_uri são obrigatórios'
            });
        }

        console.log('📱 Callback Facebook recebido');
        console.log(`Código: ${code.substring(0, 20)}...`);

        // Simular dados do Facebook (em produção, faça a troca real do código por token)
        const facebookUser = {
            id: `fb_${Date.now()}`,
            name: 'Usuário Facebook',
            email: 'usuario.facebook@exemplo.com',
            picture: {
                data: {
                    url: 'https://via.placeholder.com/150'
                }
            }
        };

        // Buscar ou criar usuário
        let usuario = await prisma.usuario.findUnique({
            where: { facebook_id: facebookUser.id }
        });
        
        let novoUsuario = false;

        if (!usuario) {
            // Verificar se já existe usuário com mesmo email
            const usuarioExistente = await prisma.usuario.findUnique({
                where: { email: facebookUser.email }
            });

            if (usuarioExistente) {
                // Vincular conta Facebook ao usuário existente
                usuario = await prisma.usuario.update({
                    where: { id: usuarioExistente.id },
                    data: {
                        facebook_id: facebookUser.id,
                        avatar_url: facebookUser.picture.data.url,
                        provider: 'facebook',
                        ultimo_login: new Date(),
                        email_verificado: true
                    }
                });
            } else {
                // Criar novo usuário
                usuario = await prisma.usuario.create({
                    data: {
                        nome: facebookUser.name,
                        email: facebookUser.email,
                        facebook_id: facebookUser.id,
                        avatar_url: facebookUser.picture.data.url,
                        provider: 'facebook',
                        email_verificado: true,
                        ativo: true,
                        ultimo_login: new Date()
                    }
                });
                novoUsuario = true;
            }
            
            console.log(`🆕 ${novoUsuario ? 'Novo usuário criado' : 'Conta vinculada'} via Facebook: ${usuario.nome}`);
        } else {
            // Atualizar último login
            usuario = await prisma.usuario.update({
                where: { id: usuario.id },
                data: { ultimo_login: new Date() }
            });
            console.log(`🔐 Login via Facebook: ${usuario.nome}`);
        }

        const token = `facebook_token_${usuario.id}_${Date.now()}`;

        res.json({
            sucesso: true,
            mensagem: 'Login com Facebook realizado com sucesso',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                avatar_url: usuario.avatar_url,
                provider: usuario.provider,
                email_verificado: usuario.email_verificado
            },
            novo_usuario: novoUsuario
        });

    } catch (error) {
        console.error('❌ Erro no callback Facebook:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// =======================================================
// ROTAS DE GOOGLE OAUTH 2.0
// =======================================================

// 🔗 Obter URL de login do Google
app.get('/api/auth/google/url', (req, res) => {
    try {
        const { redirect_uri } = req.query;

        if (!redirect_uri) {
            return res.status(400).json({
                sucesso: false,
                erro: 'redirect_uri é obrigatório'
            });
        }

        const authUrl = googleService.getGoogleAuthUrl();
        
        console.log('🔗 URL de login Google gerada');

        res.json({
            sucesso: true,
            auth_url: authUrl,
            redirect_uri: redirect_uri
        });

    } catch (error) {
        console.error('❌ Erro ao gerar URL Google:', error);
        res.status(500).json({
            sucesso: false,
            erro: error.message || 'Erro interno do servidor'
        });
    }
});

// 🔐 Iniciar autenticação com Google (via Passport)
app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 📱 Callback do Google OAuth
app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const usuario = req.user;
            
            console.log('✅ Login Google bem-sucedido:', usuario.email);

            // Gerar token JWT
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET || 'world-bite-secret-2024',
                { expiresIn: '7d' }
            );

            // Redirecionar para o frontend com o token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                fotoPerfil: usuario.fotoPerfil
            }))}`);

        } catch (error) {
            console.error('❌ Erro no callback Google:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
        }
    }
);

// 📊 Status da API
app.get('/api/status', async (req, res) => {
    try {
        const totalUsuarios = await prisma.usuario.count({
            where: { ativo: true }
        });

        const totalRestaurantes = await prisma.restaurante.count({
            where: { ativo: true }
        });

        res.json({
            status: 'OK',
            mensagem: '🚀 World Bite API - Servidor com PostgreSQL',
            modo: 'PRODUÇÃO (Dados persistentes)',
            usuarios_cadastrados: totalUsuarios,
            restaurantes_cadastrados: totalRestaurantes,
            banco_dados: 'PostgreSQL + Prisma',
            apis: {
                usuarios: {
                    cadastro: 'POST /api/usuarios/cadastro',
                    codigo_email: 'POST /api/usuarios/codigo-email',
                    codigo_sms: 'POST /api/usuarios/codigo-sms',
                    login: 'POST /api/usuarios/login',
                    listar: 'GET /api/usuarios',
                    buscar: 'GET /api/usuarios/:id',
                    atualizar: 'PUT /api/usuarios/:id',
                    desativar: 'DELETE /api/usuarios/:id'
                },
                facebook: {
                    login_url: 'GET /api/auth/facebook/url?redirect_uri=URL',
                    callback: 'POST /api/auth/facebook/callback'
                },
                restaurantes: {
                    send_verification: 'POST /api/send-verification-code',
                    verify_code: 'POST /api/verify-code',
                    login_rapido: 'POST /api/login-rapido'
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro no status:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// =======================================================
// ROTAS PÚBLICAS (CADASTRO E LOGIN)
// =======================================================

// --- Rota para criar um novo restaurante (CRUD: CREATE) ---
app.post('/restaurantes', async (req, res) => {
    try {
        let {
            nome,
            cnpj,
            descricao,
            endereco,
            telefone_contato,
            email_contato,
            pais_id,
            horario_abertura,
            horario_fechamento
        } = req.body;

        // Validar campos obrigatórios
        if (!nome || !cnpj || !endereco || !pais_id) {
            return res.status(400).json({
                error: "Campos obrigatórios não foram preenchidos."
            });
        }

        // Limpar CNPJ
        const cnpjLimpo = cnpj.replace(/\D/g, "");

        // Verificar duplicado
        const restauranteExistente = await prisma.restaurante.findUnique({
            where: { cnpj: cnpjLimpo }
        });

        if (restauranteExistente) {
            return res.status(409).json({
                error: "Já existe um restaurante cadastrado com este CNPJ."
            });
        }

        // Converter time → Date
        const parseTime = (t) => {
            if (!t) return null;
            return new Date(`1970-01-01T${t}:00Z`);
        };

        const novoRestaurante = await prisma.restaurante.create({
            data: {
                nome,
                cnpj: cnpjLimpo,
                descricao,
                endereco,
                telefone_contato,
                email_contato,
                pais_id,
                horario_abertura: parseTime(horario_abertura),
                horario_fechamento: parseTime(horario_fechamento),
            }
        });

        return res.status(201).json({
            message: "Restaurante cadastrado com sucesso!",
            restaurante: novoRestaurante
        });

    } catch (error) {
        console.error("❌ Erro ao cadastrar restaurante:", error);
        return res.status(500).json({
            error: "Erro interno ao cadastrar restaurante."
        });
    }
});


// --- Rota para verificar o código e autenticar o usuário ---
app.post('/api/verify-code', async (req, res) => {
    const { cnpj, code } = req.body;

    if (!cnpj || !code) {
        return res.status(400).json({ error: 'CNPJ e código de verificação são obrigatórios.' });
    }
    
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    const storedCode = verificationCodes[cnpjLimpo];

    if (!storedCode || storedCode !== code.trim()) {
        return res.status(401).json({ error: 'Código de verificação inválido.' });
    }
    
    const restaurante = await prisma.restaurante.findUnique({
        where: { cnpj: cnpjLimpo },
        select: { nome: true }
    });
    
    // delete verificationCodes[cnpjLimpo]; // Descomente para produção

    res.status(200).json({ 
        success: true, 
        message: 'Login bem-sucedido!', 
        nomeRestaurante: restaurante ? restaurante.nome : 'Restaurante',
        token: 'seu-token-de-autenticacao' 
    });
});

// 🔑 ROTA DE LOGIN RÁPIDO AGORA ESTÁ AQUI (antes das rotas protegidas)
app.post('/api/login-rapido', async (req, res) => {
    const { cnpj } = req.body;

    if (!cnpj) {
        return res.status(400).json({ error: 'CNPJ é obrigatório.' });
    }

    try {
        const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
        
        const restaurante = await prisma.restaurante.findUnique({
            where: { cnpj: cnpjLimpo },
        });

        if (!restaurante) {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        const codigoFixo = '1234'; 
        verificationCodes[cnpjLimpo] = codigoFixo;

        console.log(`[DEV MODE] Código Fixo ${codigoFixo} armazenado para CNPJ: ${cnpjLimpo}`);

        res.status(200).json({ 
            message: `Login rápido ativado! Use o código ${codigoFixo}.` 
        });

    } catch (err) {
        console.error('Erro no login rápido:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});
// =======================================================
// ROTA QUE O FRONTEND USA: ENVIO DE SMS PARA LOGIN DO RESTAURANTE
// =======================================================
app.post('/api/send-verification-code', async (req, res) => {
    try {
        const { cnpj } = req.body;

        if (!cnpj) {
            return res.status(400).json({ error: 'CNPJ é obrigatório.' });
        }

        const cnpjLimpo = cnpj.replace(/\D/g, '');

        // Buscar restaurante no banco
        const restaurante = await prisma.restaurante.findUnique({
            where: { cnpj: cnpjLimpo }
        });

        if (!restaurante) {
            return res.status(404).json({
                error: 'Restaurante não encontrado.'
            });
        }

        if (!restaurante.telefone_contato) {
            return res.status(400).json({
                error: 'Este restaurante não possui telefone cadastrado.'
            });
        }

        // Criar código de 4 dígitos
        const codigo = Math.floor(1000 + Math.random() * 9000).toString();

        // Salvar código temporário
        verificationCodes[cnpjLimpo] = codigo;

        console.log('📱 ENVIANDO CÓDIGO POR SMS PARA LOGIN DO RESTAURANTE');
        console.log(`CNPJ: ${cnpjLimpo}`);
        console.log(`Telefone: ${restaurante.telefone_contato}`);
        console.log(`Código: ${codigo}`);
        console.log('──────────────────────────────────────────────');

        // Enviar SMS real (ou simulado no dev)
        try {
            await smsService.enviarCodigoVerificacao(
                restaurante.telefone_contato,
                codigo
            );
        } catch (smsError) {
            console.error('⚠️ Erro ao enviar SMS via Vonage:', smsError);
            // Não retorne erro — o código foi gerado
        }

        return res.status(200).json({
            success: true,
            requestId: `req_${Date.now()}`,
            message: "Código enviado com sucesso!"
        });

    } catch (err) {
        console.error('❌ Erro em /api/send-verification-code:', err);
        return res.status(500).json({
            error: 'Erro interno ao enviar código.'
        });
    }
});

// =======================================================
// ROTA DE TESTE DE EMAIL
// =======================================================

app.get('/api/test-email', async (req, res) => {
    try {
        console.log('🧪 Testando configuração de email...');
        
        // Testar conexão
        const connectionTest = await emailService.testConnection();
        
        if (!connectionTest.success) {
            return res.status(500).json({
                sucesso: false,
                erro: 'Falha na conexão com servidor de email',
                detalhes: connectionTest.error
            });
        }

        // Enviar email de teste se foi fornecido um email na query
        const { email } = req.query;
        if (email) {
            const emailResult = await emailService.sendVerificationEmail(email, '123456', 'Teste');
            return res.json({
                sucesso: true,
                mensagem: 'Teste de email concluído',
                conexao: connectionTest,
                email: emailResult
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Conexão com servidor de email OK',
            conexao: connectionTest,
            dica: 'Use ?email=seuemail@teste.com para testar envio'
        });

    } catch (error) {
        console.error('❌ Erro no teste de email:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno no teste de email',
            detalhes: error.message
        });
    }
});

// =======================================================
// ROTAS PROTEGIDAS (REQUER AUTH)
// =======================================================

// 🔑 INTEGRAÇÃO DO CRUD DE PRATOS
app.use('/api/restaurante/prato', pratoRoutes); 

// 🔑 INTEGRAÇÃO DAS ROTAS DE PAGAMENTOS
app.use('/api/pagamentos', pagamentosRoutes);

// 🔑 INTEGRAÇÃO DAS ROTAS DE PEDIDOS
app.use('/api/pedidos', pedidosRoutes);

// 🔑 INTEGRAÇÃO DAS ROTAS DE RELATÓRIOS
app.use('/api/relatorios', relatoriosRoutes);

// 🏠 Rota principal
app.get('/', (req, res) => {
    res.json({
        mensagem: 'World Bite API - Servidor Unificado',
        status: 'Funcionando com PostgreSQL + Prisma',
        documentacao: 'GET /api/status',
        versao: '2.0.0 - Consolidado'
    });
});

// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


const enderecosRoutes = require('./routes/enderecos');
app.use('/api/usuarios/enderecos', enderecosRoutes);
