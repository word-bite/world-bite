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
        await prisma.$connect();
        console.log('Conexão bem-sucedida com o PostgreSQL usando Prisma!');
    } catch (err) {
        console.error('Erro na conexão com o banco de dados:', err);
    } finally {
        if (prisma.$disconnect) await prisma.$disconnect();
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

// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});