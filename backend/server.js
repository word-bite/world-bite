// server.js

// 1. Importar os módulos
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Nexmo = require('nexmo'); 
const jwt = require('jsonwebtoken'); // 🔑 Implementação do JWT

// Importar o cliente do Prisma
const prisma = require('./config/database.js');

// Importar o serviço de email
const emailService = require('./services/emailService');

// 🔑 IMPORTAÇÃO DAS ROTAS (Estrutura modular)
const pratoRoutes = require('./routes/pratos');
const pedidoRoutes = require('./routes/pedidos');
const usuarioRoutes = require('./routes/usuarioRoutes'); // Rotas PROTEGIDAS de usuário (ex: CRUD Endereços)
const pagamentoRoutes = require('./routes/pagamentos');

// 2. Configurar a aplicação Express e Nexmo
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar o Nexmo com suas credenciais do .env
const nexmo = new Nexmo({ 
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});

// Objeto para armazenar códigos de verificação temporariamente (NÃO usar em produção)
const verificationCodes = {};

// 3. Middlewares
app.use(cors());
app.use(express.json());
// ⚠️ IMPORTANTE: usuarioRoutes (protegidas) são registradas no FINAL do arquivo
// para que as rotas públicas (/api/usuarios/cadastro, /codigo-email, etc) sejam processadas primeiro

// 4. Testar a conexão com o Prisma (opcional, mas útil)
(async () => {
    try {
        if (prisma) {
            await prisma.$connect();
            console.log('✅ Conexão bem-sucedida com o PostgreSQL usando Prisma!');
        } else {
            console.log('⚠️  PostgreSQL não está disponível. As APIs funcionarão mas retornarão erro específico.');
        }
    } catch (err) {
        console.error('Erro na conexão com o banco de dados:', err);
    } finally {
        // Nada de desconectar o Prisma!
    }
})();

// =======================================================
// ROTAS DE USUÁRIOS - AUTENTICAÇÃO SEM SENHA (PÚBLICAS)
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
    console.log('🔵 ========================================');
    console.log('🔵 REQUISIÇÃO RECEBIDA: /api/usuarios/codigo-email');
    console.log('🔵 Body:', req.body);
    console.log('🔵 Headers:', req.headers);
    console.log('🔵 ========================================');
    
    try {
        const { email } = req.body;

        if (!email) {
            console.log('❌ Email não fornecido');
            return res.status(400).json({
                sucesso: false,
                erro: 'Email é obrigatório'
            });
        }
        
        console.log(`✅ Email recebido: ${email}`);        // Buscar ou criar usuário
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

        // TODO: Implementar a chamada real ao Nexmo (Vonage)
        // nexmo.message.sendSms(from, to, text, (err, responseData) => { ... });

        res.json({
            sucesso: true,
            mensagem: 'Código de verificação enviado por SMS'
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
        
        // --- Geração do JWT real ---
        if (!process.env.JWT_SECRET) {
             console.error('❌ ERRO CRÍTICO: JWT_SECRET não está definido no .env');
             return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
        }
        
        const tokenPayload = { id: usuarioAtualizado.id };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token expira em 7 dias
        });
        // ---------------------------

        console.log(`🔐 Login realizado: ${usuario.nome} (${identificador})`);

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token: token, // Agora é um JWT válido
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

// 📋 Listar usuários (Não deve ser pública em produção, mas mantido como estava)
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

// 🔍 Buscar usuário por ID (Também deveria ser protegida ou removida)
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

// ✏️ Atualizar usuário (Também deveria ser protegida)
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

// 🗑️ Desativar usuário (soft delete) (Também deveria ser protegida)
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

        // Simular dados do Facebook (Em produção, faça a troca real do código por token)
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
        
        // --- Geração do JWT real ---
        if (!process.env.JWT_SECRET) {
             console.error('❌ ERRO CRÍTICO: JWT_SECRET não está definido no .env');
             return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
        }

        const tokenPayload = { id: usuario.id };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        // ---------------------------

        res.json({
            sucesso: true,
            mensagem: 'Login com Facebook realizado com sucesso',
            token: token, // Agora é um JWT válido
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
                    desativar: 'DELETE /api/usuarios/:id',
                    enderecos_crud: 'CRUD /api/usuarios/enderecos (Protegida)' // Adicionado
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
// ROTAS PÚBLICAS (CADASTRO E LOGIN DE RESTAURANTE)
// =======================================================

// --- Rota para criar um novo restaurante (CRUD: CREATE) ---
app.post('/restaurantes', async (req, res) => {
    try {
        const {
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

        // Validação básica
        if (!nome || !cnpj || !endereco) {
            return res.status(400).json({ error: 'Nome, CNPJ e Endereço são obrigatórios.' });
        }

        // Verifica se já existe restaurante com o mesmo CNPJ
        const existente = await prisma.restaurante.findUnique({ where: { cnpj } });
        if (existente) {
            return res.status(409).json({ error: 'Já existe restaurante com esse CNPJ.' });
        }

        // Cria restaurante
        const horario_abertura_dt = horario_abertura
        ? `2025-01-01T${horario_abertura}:00.000Z`
        : null;
        const horario_fechamento_dt = horario_fechamento
        ? `2025-01-01T${horario_fechamento}:00.000Z`
        : null;

        const novoRestaurante = await prisma.restaurante.create({
        data: {
            nome,
            cnpj,
            descricao,
            endereco,
            telefone_contato,
            email_contato,
            pais_id,
            horario_abertura: horario_abertura_dt,
            horario_fechamento: horario_fechamento_dt,
            ativo: true
        }
        });

        res.status(201).json(novoRestaurante);
    } catch (error) {
        console.error('Erro ao cadastrar restaurante:', error);
        res.status(500).json({ error: 'Erro interno ao cadastrar restaurante.' });
    }
});

// --- Rota para enviar o código de verificação por CNPJ ---
app.post('/api/send-verification-code', async (req, res) => {
    const { cnpj } = req.body;

    if (!cnpj) {
        return res.status(400).json({ error: 'CNPJ é obrigatório.' });
    }

    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    try {
        const restaurante = await prisma.restaurante.findUnique({
            where: { cnpj: cnpjLimpo },
            select: { telefone_contato: true, nome: true }
        });

        if (!restaurante) {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const phoneNumber = restaurante.telefone_contato;

        verificationCodes[cnpjLimpo] = verificationCode;

        const from = "World Bite";
        const to = phoneNumber;
        const text = `Seu código de verificação World Bite é: ${verificationCode}`;

        nexmo.message.sendSms(from, to, text, (err, responseData) => {
            if (err) {
                console.error('Erro na API do Nexmo:', err);
                return res.status(500).json({ error: 'Erro no envio do SMS.' });
            }
            if (responseData.messages[0]['status'] === "0") {
                console.log(`Mensagem enviada com sucesso para ${to}`);
                res.status(200).json({ message: 'Código de verificação enviado!' });
            } else {
                console.error('Erro no envio do SMS:', responseData.messages[0]['error-text']);
                res.status(500).json({ error: 'Erro no envio do SMS.' });
            }
        });

    } catch (err) {
        console.error('Erro geral ao processar a requisição:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
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
        select: { id: true, nome: true }
    });

    // TODO: Gerar e enviar um JWT real para o restaurante
    // delete verificationCodes[cnpjLimpo]; // Descomente para produção

    res.status(200).json({ 
        success: true, 
        message: 'Login bem-sucedido!', 
        nomeRestaurante: restaurante ? restaurante.nome : 'Restaurante',
        token: 'seu-token-de-autenticacao-restaurante' // Placeholder
    });
});

// 🔑 ROTA DE LOGIN RÁPIDO PARA DEV/TESTE
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

// 👤 ROTAS PROTEGIDAS DO USUÁRIO (Endereços, Perfil, etc.)
// Assumindo que este roteador tem o Middleware de autenticação
app.use('/api/usuarios', usuarioRoutes);

// 🔑 INTEGRAÇÃO DO CRUD DE PRATOS (Restaurante)
app.use('/api/restaurante/prato', pratoRoutes);

// 🔑 ROTAS DOS PEDIDOS (Sistema de Retirada)
app.use('/api/pedidos', pedidoRoutes);

// 💳 ROTAS DE PAGAMENTOS (Mercado Pago)
app.use('/api/pagamentos', pagamentoRoutes);

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