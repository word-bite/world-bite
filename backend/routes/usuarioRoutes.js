// backend/routes/usuarioRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// 👇 CORREÇÃO AQUI: Use 'require' e puxe 'authUsuario' do objeto exportado
const { authUsuario } = require('../middlewares/authMiddleware.js');

const prisma = new PrismaClient();
const router = express.Router();

// 👇 CORREÇÃO AQUI: Aplica o middleware 'authUsuario' (e não um 'authMiddleware' genérico)
router.use(authUsuario);

// 1. GET: Listar todos os endereços do usuário logado
router.get('/enderecos', async (req, res) => {
  try {
    // 'req.userId' agora é fornecido pelo middleware 'authUsuario'
    const { userId } = req; 

    const enderecos = await prisma.endereco.findMany({
      where: { usuarioId: userId },
      orderBy: { dataCriacao: 'desc' },
    });

    res.json({ sucesso: true, enderecos });
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// 2. POST: Adicionar um novo endereço para o usuário logado
router.post('/enderecos', async (req, res) => {
  try {
    // 'req.userId' vem do middleware
    const { userId } = req;
    const { logradouro, numero, bairro, cidade, estado, cep, complemento, apelido } = req.body;

    if (!logradouro || !numero || !bairro || !cidade || !estado || !cep) {
      return res.status(400).json({ sucesso: false, erro: 'Campos obrigatórios ausentes.' });
    }

    const novoEndereco = await prisma.endereco.create({
      data: {
        logradouro,
        numero,
        bairro,
        cidade,
        estado: estado.toUpperCase(),
        cep,
        complemento,
        apelido,
        usuarioId: userId, // Vincula ao usuário logado
      },
    });

    res.status(201).json({ sucesso: true, endereco: novoEndereco });
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// 3. DELETE: Deletar um endereço específico
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

    // Validação de segurança crucial:
    if (endereco.usuarioId !== userId) {
      return res.status(403).json({ sucesso: false, erro: 'Acesso negado. Este endereço não pertence a você.' });
    }

    await prisma.endereco.delete({
      where: { id: parseInt(enderecoId) },
    });

    res.json({ sucesso: true, mensagem: 'Endereço deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar endereço:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// 👇 CORREÇÃO AQUI: Exporte usando CommonJS
module.exports = router;