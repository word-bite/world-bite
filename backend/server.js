// server.js

// 1. Importar os módulos
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Nexmo = require('nexmo'); 

// Importar o cliente do Prisma
const prisma = require('./config/database.js');

// 2. Configurar a aplicação Express e Nexmo
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar o Nexmo com suas credenciais do .env
const nexmo = new Nexmo({ 
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});

// Objeto para armazenar códigos de verificação temporariamente (não usar em produção)
const verificationCodes = {};

// 3. Middlewares
app.use(cors());
app.use(express.json());

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
        console.error('❌ Erro na conexão com o banco de dados:', err.message);
        console.log('💡 Para resolver: configure PostgreSQL ou use Docker (veja README.md)');
    }
})();

// --- Rota para criar um novo restaurante (CRUD: CREATE) ---
app.post('/restaurantes', async (req, res) => {
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

    try {
        if (!nome || !cnpj || !endereco || !pais_id) {
            return res.status(400).json({ error: 'Os campos nome, cnpj, endereco e pais_id são obrigatórios.' });
        }

        const horarioAberturaDate = new Date(`1970-01-01T${horario_abertura}:00Z`);
        const horarioFechamentoDate = new Date(`1970-01-01T${horario_fechamento}:00Z`);

        const novoRestaurante = await prisma.restaurante.create({
            data: {
                nome,
                cnpj,
                descricao,
                endereco,
                telefone_contato,
                email_contato,
                pais_id,
                horario_abertura: horarioAberturaDate,
                horario_fechamento: horarioFechamentoDate
            },
        });

        res.status(201).json(novoRestaurante);

    } catch (err) {
        console.error('Erro ao cadastrar restaurante:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- Rota para enviar o código de verificação por CNPJ ---
app.post('/api/send-verification-code', async (req, res) => {
    const { cnpj } = req.body;

    if (!cnpj) {
        return res.status(400).json({ error: 'CNPJ é obrigatório.' });
    }

    try {
        const restaurante = await prisma.restaurante.findUnique({
            where: {
                cnpj: cnpj,
            },
        });

        if (!restaurante) {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const phoneNumber = restaurante.telefone_contato;

        verificationCodes[cnpj] = verificationCode;

        const from = "World Bite";
        const to = phoneNumber;
        const text = `Seu código de verificação World Bite é: ${verificationCode}`;

        // --- Mudança no método de envio ---
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

    console.log('Dados recebidos para verificação:');
    console.log('CNPJ:', cnpj);
    console.log('Código:', code);

    if (!cnpj || !code) {
        return res.status(400).json({ error: 'CNPJ e código de verificação são obrigatórios.' });
    }

    const storedCode = verificationCodes[cnpj];
    console.log('Código armazenado:', storedCode);

    if (!storedCode || storedCode !== code.trim()) {
        return res.status(401).json({ error: 'Código de verificação inválido.' });
    }

    // A linha "delete" está comentada para fins de depuração
    // delete verificationCodes[cnpj];
    
    // CORREÇÃO: Adicionando 'success: true' na resposta
    res.status(200).json({ success: true, message: 'Login bem-sucedido!', token: 'seu-token-de-autenticacao' });
});

// === CRUD DE USUÁRIOS ===
// Importar o serviço de usuários
const usuarioService = require('./services/usuarioService');
const facebookService = require('./services/facebookService');

/**
 * 1. CADASTRAR USUÁRIO (sem senha)
 * POST /api/usuarios/cadastro
 */
app.post('/api/usuarios/cadastro', async (req, res) => {
    try {
        const resultado = await usuarioService.cadastrarUsuario(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(400).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 2. ENVIAR CÓDIGO POR EMAIL
 * POST /api/usuarios/codigo-email
 */
app.post('/api/usuarios/codigo-email', async (req, res) => {
    try {
        const { email } = req.body;
        const resultado = await usuarioService.enviarCodigoEmail(email);
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 3. ENVIAR CÓDIGO POR SMS
 * POST /api/usuarios/codigo-sms
 */
app.post('/api/usuarios/codigo-sms', async (req, res) => {
    try {
        const { telefone } = req.body;
        const resultado = await usuarioService.enviarCodigoSMS(telefone);
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 4. VERIFICAR CÓDIGO E FAZER LOGIN
 * POST /api/usuarios/login
 */
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { identificador, codigo } = req.body;
        const resultado = await usuarioService.verificarCodigoELogin(identificador, codigo);
        res.json(resultado);
    } catch (error) {
        res.status(401).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 5. LISTAR USUÁRIOS
 * GET /api/usuarios
 */
app.get('/api/usuarios', async (req, res) => {
    try {
        const resultado = await usuarioService.listarUsuarios();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 6. BUSCAR USUÁRIO POR ID
 * GET /api/usuarios/:id
 */
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await usuarioService.buscarUsuarioPorId(id);
        res.json(resultado);
    } catch (error) {
        res.status(404).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 7. ATUALIZAR USUÁRIO
 * PUT /api/usuarios/:id
 */
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await usuarioService.atualizarUsuario(id, req.body);
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

/**
 * 8. DESATIVAR USUÁRIO
 * DELETE /api/usuarios/:id
 */
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await usuarioService.desativarUsuario(id);
        res.json(resultado);
    } catch (error) {
        res.status(404).json({ 
            sucesso: false, 
            erro: error.message 
        });
    }
});

// === AUTENTICAÇÃO FACEBOOK ===

/**
 * 9. LOGIN COM FACEBOOK - CALLBACK
 * POST /api/auth/facebook/callback
 */
app.post('/api/auth/facebook/callback', async (req, res) => {
    try {
        const { code, redirect_uri } = req.body;

        if (!code || !redirect_uri) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Código de autorização e redirect_uri são obrigatórios'
            });
        }

        console.log('📱 Callback do Facebook recebido...');
        const resultado = await facebookService.completeLogin(code, redirect_uri);

        if (resultado.success) {
            res.json({
                sucesso: true,
                mensagem: 'Login com Facebook realizado com sucesso',
                token: resultado.token,
                usuario: resultado.user,
                novo_usuario: resultado.isNewUser
            });
        } else {
            res.status(400).json({
                sucesso: false,
                erro: resultado.error
            });
        }
    } catch (error) {
        console.error('❌ Erro no callback Facebook:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * 10. LOGIN DIRETO COM ACCESS TOKEN
 * POST /api/auth/facebook/token
 */
app.post('/api/auth/facebook/token', async (req, res) => {
    try {
        const { access_token } = req.body;

        if (!access_token) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Access token é obrigatório'
            });
        }

        console.log('🎯 Login direto com access token...');

        const validation = await facebookService.validateFacebookToken(access_token);
        if (!validation.valid) {
            return res.status(401).json({
                sucesso: false,
                erro: validation.error
            });
        }

        const profileResult = await facebookService.getUserProfile(access_token);
        if (!profileResult.success) {
            return res.status(400).json({
                sucesso: false,
                erro: profileResult.error
            });
        }

        const authResult = await facebookService.authenticateUser(
            profileResult.user, 
            access_token
        );

        res.json({
            sucesso: true,
            mensagem: 'Login com Facebook realizado com sucesso',
            token: authResult.token,
            usuario: authResult.user,
            novo_usuario: authResult.isNewUser
        });

    } catch (error) {
        console.error('❌ Erro no login com token:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * 11. OBTER URL DE LOGIN DO FACEBOOK
 * GET /api/auth/facebook/url
 */
app.get('/api/auth/facebook/url', (req, res) => {
    try {
        const { redirect_uri } = req.query;

        if (!redirect_uri) {
            return res.status(400).json({
                sucesso: false,
                erro: 'redirect_uri é obrigatório como query parameter'
            });
        }

        const facebookAppId = process.env.FACEBOOK_APP_ID;
        if (!facebookAppId) {
            return res.status(500).json({
                sucesso: false,
                erro: 'FACEBOOK_APP_ID não configurado no .env'
            });
        }

        const scope = 'email,public_profile';
        const responseType = 'code';
        
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
            `client_id=${facebookAppId}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
            `scope=${scope}&` +
            `response_type=${responseType}&` +
            `state=random_${Date.now()}`;

        res.json({
            sucesso: true,
            auth_url: authUrl,
            app_id: facebookAppId,
            redirect_uri: redirect_uri
        });

    } catch (error) {
        console.error('❌ Erro ao gerar URL do Facebook:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Rota de status para verificar as APIs disponíveis
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        mensagem: 'World Bite API - Backend Acadêmico',
        apis: {
            restaurantes: {
                cadastro: 'POST /restaurantes',
                verificacao_sms: 'POST /api/send-verification-code',
                login_cnpj: 'POST /api/verify-code'
            },
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
                callback: 'POST /api/auth/facebook/callback',
                token_login: 'POST /api/auth/facebook/token'
            }
        },
        timestamp: new Date().toISOString()
    });
});

// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});