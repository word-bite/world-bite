// backend/routes/pratos.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
// 🔑 CORREÇÃO: Desestrutura a função 'authRestaurante' do objeto exportado
const { authRestaurante } = require('../middlewares/authMiddleware'); 

const router = express.Router();
const prisma = new PrismaClient();

// =======================================================
// ROTA 1: CRIAÇÃO (POST)
// =======================================================
router.post('/', authRestaurante, async (req, res) => {
    
    const restauranteId = req.restauranteId;
    
    // 1. Coleta os dados. Note que 'disponivel' é opcional e será true por padrão no Prisma.
    const { nome, descricao, preco, categoria, urlImagem } = req.body;
    
    if (!nome || !descricao || !preco || !categoria) {
        return res.status(400).json({ error: 'Faltam campos obrigatórios (nome, descrição, preço, categoria).' });
    }

    try {
        const novoPrato = await prisma.prato.create({
            data: {
                nome,
                descricao,
                preco: parseFloat(preco), 
                categoria,
                urlImagem,
                restauranteId, 
            },
        });
        
        res.status(201).json({ 
            message: 'Prato cadastrado com sucesso!', 
            prato: novoPrato 
        });

    } catch (error) {
        console.error('Erro ao cadastrar prato:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o prato.' });
    }
});

// =======================================================
// ROTA 2: LEITURA (GET)
// =======================================================
router.get('/', authRestaurante, async (req, res) => {
    const restauranteId = req.restauranteId;
    
    try {
        const pratos = await prisma.prato.findMany({
            where: { restauranteId: restauranteId },
            orderBy: { nome: 'asc' },
        });

        res.status(200).json(pratos);
        
    } catch (error) {
        console.error('Erro ao listar pratos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar pratos.' });
    }
});

// =======================================================
// ROTA 3: ATUALIZAÇÃO (PUT /:id)
// =======================================================
router.put('/:id', authRestaurante, async (req, res) => {
    const restauranteId = req.restauranteId;
    const pratoId = parseInt(req.params.id);
    const { nome, descricao, preco, categoria, urlImagem, disponivel } = req.body;

    if (!nome || !descricao || !preco || !categoria) {
        return res.status(400).json({ error: 'Faltam campos obrigatórios para atualização.' });
    }
    
    try {
        // 1. Verifica se o prato pertence ao restaurante logado antes de atualizar
        const prato = await prisma.prato.findFirst({
            where: { id: pratoId, restauranteId: restauranteId },
        });

        if (!prato) {
            return res.status(404).json({ error: 'Prato não encontrado ou você não tem permissão para editar.' });
        }
        
        // 2. Atualiza o prato
        const pratoAtualizado = await prisma.prato.update({
            where: { id: pratoId },
            data: {
                nome,
                descricao,
                preco: parseFloat(preco), 
                categoria,
                urlImagem,
                // O 'disponivel' é booleano, e é enviado pelo frontend
                disponivel: disponivel 
            },
        });

        res.status(200).json({ message: 'Prato atualizado com sucesso!', prato: pratoAtualizado });

    } catch (error) {
        console.error('Erro ao atualizar prato:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar prato.' });
    }
});

// =======================================================
// ROTA 4: EXCLUSÃO (DELETE /:id)
// =======================================================
router.delete('/:id', authRestaurante, async (req, res) => {
    const restauranteId = req.restauranteId;
    const pratoId = parseInt(req.params.id);

    try {
        // 1. Verifica se o prato pertence ao restaurante logado antes de excluir
        const prato = await prisma.prato.findFirst({
            where: { id: pratoId, restauranteId: restauranteId },
        });

        if (!prato) {
            return res.status(404).json({ error: 'Prato não encontrado ou você não tem permissão para excluí-lo.' });
        }

        // 2. Exclui o prato
        await prisma.prato.delete({
            where: { id: pratoId },
        });

        res.status(200).json({ message: 'Prato excluído com sucesso.' });

    } catch (error) {
        console.error('Erro ao excluir prato:', error);
        res.status(500).json({ error: 'Erro interno ao excluir prato.' });
    }
});

module.exports = router;