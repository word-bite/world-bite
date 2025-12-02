import express from 'express';
import { verificationService } from '../services/verificationService.js';
import prisma from '../config/database.js'; // Importe o cliente do Prisma

const router = express.Router();

router.post('/send-verification-code', async (req, res) => {
    const { cnpj } = req.body;

    if (!cnpj) {
        return res.status(400).json({ error: 'CNPJ é obrigatório.' });
    }

    try {
        // 1. Busque o restaurante no banco de dados usando o Prisma
        // Usamos findUnique para buscar por um campo único como o CNPJ
        const restaurante = await prisma.restaurante.findUnique({
            where: {
                cnpj: cnpj,
            },
        });

        if (!restaurante || !restaurante.telefone) {
            return res.status(404).json({ error: 'Restaurante não encontrado ou telefone não cadastrado.' });
        }

        const phoneNumber = restaurante.telefone; // O número deve estar no formato E.164
        
        // 2. Chame o serviço Vonage para iniciar a verificação
        const requestId = await verificationService.startVerification(phoneNumber);

        // 3. Retorne o ID da requisição para o frontend
        res.status(200).json({ requestId });

    } catch (error) {
        console.error('Erro ao iniciar verificação:', error);
        res.status(500).json({ error: 'Falha ao enviar o código de verificação.' });
    }
});

router.post('/verify-code', async (req, res) => {
    const { requestId, code } = req.body;

    if (!requestId || !code) {
        return res.status(400).json({ error: 'ID da requisição e código são obrigatórios.' });
    }

    try {
        // 1. Chame o serviço Vonage para checar o código
        const result = await verificationService.checkVerification(requestId, code);

        // 2. Responda ao frontend com o resultado
        if (result.success) {
            // Se o código for válido, você pode gerar um token JWT aqui e enviar ao usuário
            res.status(200).json({ success: true, message: 'Verificação concluída. Login bem-sucedido.' });
        } else {
            res.status(400).json({ success: false, error: result.message });
        }

    } catch (error) {
        console.error('Erro ao checar código:', error);
        res.status(500).json({ error: 'Falha ao verificar o código.' });
    }
});

export default router;