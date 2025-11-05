// backend/routes/usuarioRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authUsuario } = require('../middlewares/authMiddleware.js');

const prisma = new PrismaClient();
const router = express.Router();

// Aplica autenticação em todas as rotas
router.use(authUsuario);

// 1. GET: Listar todos os endereços do usuário logado
router.get('/enderecos', async (req, res) => {
  try {
    const { userId } = req;

    const enderecos = await prisma.endereco.findMany({
      where: { usuarioId: userId },
      orderBy: { dataCriacao: 'desc' },
    });

    res.json({ sucesso: true, enderecos });
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro ao buscar endereços. Tente novamente.' });
  }
});

// 2. POST: Adicionar um novo endereço para o usuário logado
router.post('/enderecos', async (req, res) => {
  try {
    const { userId } = req;
    const { logradouro, numero, bairro, cidade, estado, cep, complemento, apelido } = req.body;

    if (!logradouro || !numero || !bairro || !cidade || !estado || !cep) {
      return res.status(400).json({ sucesso: false, erro: 'Preencha todos os campos obrigatórios.' });
    }

    const novoEndereco = await prisma.endereco.create({
      data: {
        logradouro,
        numero,
        bairro,
        cidade,
        estado: estado.toUpperCase(),
        cep,
        complemento: complemento || null,
        apelido: apelido || null,
        usuarioId: userId,
      },
    });

    res.status(201).json({ sucesso: true, endereco: novoEndereco });
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro ao salvar endereço. Tente novamente.' });
  }
});

// 3. PUT: Atualizar um endereço específico
router.put('/enderecos/:enderecoId', async (req, res) => {
  try {
    const { userId } = req;
    const { enderecoId } = req.params;
    const { logradouro, numero, bairro, cidade, estado, cep, complemento, apelido } = req.body;

    const endereco = await prisma.endereco.findUnique({
      where: { id: parseInt(enderecoId) },
    });

    if (!endereco) {
      return res.status(404).json({ sucesso: false, erro: 'Endereço não encontrado.' });
    }

    if (endereco.usuarioId !== userId) {
      return res.status(403).json({ sucesso: false, erro: 'Acesso negado.' });
    }

    const enderecoAtualizado = await prisma.endereco.update({
      where: { id: parseInt(enderecoId) },
      data: {
        logradouro,
        numero,
        bairro,
        cidade,
        estado: estado.toUpperCase(),
        cep,
        complemento: complemento || null,
        apelido: apelido || null,
      },
    });

    res.json({ sucesso: true, endereco: enderecoAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar endereço. Tente novamente.' });
  }
});

// 4. DELETE: Deletar um endereço específico
router.delete('/enderecos/:enderecoId', async (req, res) => {
  try {
    const { userId } = req;
    const { enderecoId } = req.params;

    const endereco = await prisma.endereco.findUnique({
      where: { id: parseInt(enderecoId) },
    });

    if (!endereco) {
      return res.status(404).json({ sucesso: false, erro: 'Endereço não encontrado.' });
    }

    if (endereco.usuarioId !== userId) {
      return res.status(403).json({ sucesso: false, erro: 'Acesso negado.' });
    }

    await prisma.endereco.delete({
      where: { id: parseInt(enderecoId) },
    });

    res.json({ sucesso: true, mensagem: 'Endereço deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar endereço:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro ao deletar endereço. Tente novamente.' });
  }
});

module.exports = router;
