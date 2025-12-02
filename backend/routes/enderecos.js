// routes/enderecos.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authUsuario } = require('../middlewares/authMiddleware'); // middleware correto

// =======================================================
// ROTAS DE ENDEREÇOS DE USUÁRIOS
// =======================================================

// GET /api/usuarios/enderecos
router.get('/', authUsuario, async (req, res) => {
  try {
    // req.userId já está definido pelo middleware
    if (!req.userId) {
      return res.status(400).json({ sucesso: false, erro: 'Usuário não autenticado' });
    }

    const enderecos = await prisma.endereco.findMany({
      where: { usuario_id: req.userId },
      orderBy: { id: 'desc' } // exibe os mais recentes primeiro
    });
    res.json({ sucesso: true, enderecos });
  } catch (err) {
    console.error('[GET /enderecos] erro:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro ao buscar endereços' });
  }
});

// POST /api/usuarios/enderecos
router.post('/', authUsuario, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(400).json({ sucesso: false, erro: 'Usuário não autenticado' });
    }

    const data = { ...req.body, usuario_id: req.userId };
    const novoEndereco = await prisma.endereco.create({ data });
    res.json({ sucesso: true, endereco: novoEndereco });
  } catch (err) {
    console.error('[POST /enderecos] erro:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro ao criar endereço' });
  }
});

// PUT /api/usuarios/enderecos/:id
router.put('/:id', authUsuario, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

    const enderecoExistente = await prisma.endereco.findUnique({ where: { id } });
    if (!enderecoExistente || enderecoExistente.usuario_id !== req.userId) {
      return res.status(403).json({ sucesso: false, erro: 'Não autorizado a editar este endereço' });
    }

    const enderecoAtualizado = await prisma.endereco.update({
      where: { id },
      data: req.body
    });

    res.json({ sucesso: true, endereco: enderecoAtualizado });
  } catch (err) {
    console.error('[PUT /enderecos/:id] erro:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar endereço' });
  }
});

// DELETE /api/usuarios/enderecos/:id
router.delete('/:id', authUsuario, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

    const enderecoExistente = await prisma.endereco.findUnique({ where: { id } });
    if (!enderecoExistente || enderecoExistente.usuario_id !== req.userId) {
      return res.status(403).json({ sucesso: false, erro: 'Não autorizado a excluir este endereço' });
    }

    await prisma.endereco.delete({ where: { id } });
    res.json({ sucesso: true });
  } catch (err) {
    console.error('[DELETE /enderecos/:id] erro:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro ao excluir endereço' });
  }
});

module.exports = router;
