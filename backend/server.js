// server.js

// 1. Importar os módulos
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Nexmo = require('nexmo'); 

// Importar o cliente do Prisma
const prisma = require('./config/database.js');

// 🔑 IMPORTAÇÃO DAS ROTAS DE PRATOS
const pratoRoutes = require('./routes/pratos');

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

// 4. Testar a conexão com o Prisma (opcional, mas útil)
(async () => {
    try {
        await prisma.$connect();
        console.log('Conexão bem-sucedida com o PostgreSQL usando Prisma!');
    } catch (err) {
        console.error('Erro na conexão com o banco de dados:', err);
    } finally {
        // Nada de desconectar o Prisma!
    }
})();

// =======================================================
// ROTAS PÚBLICAS (CADASTRO E LOGIN)
// =======================================================

// --- Rota para criar um novo restaurante (CRUD: CREATE) ---
app.post('/restaurantes', async (req, res) => {
    // ... CÓDIGO DA ROTA DE CADASTRO DE RESTAURANTE ... (inalterado)
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
// ROTAS PROTEGIDAS (REQUER AUTH)
// =======================================================

// 🔑 INTEGRAÇÃO DO CRUD DE PRATOS
app.use('/api/restaurante/prato', pratoRoutes); 

// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});