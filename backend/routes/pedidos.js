// backend/routes/pedidos.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Função para gerar código de retirada de 4 dígitos
const gerarCodigoRetirada = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Função para enviar notificação (SMS/Email)
const enviarNotificacao = async (cliente, codigo, nomeRestaurante) => {
    const mensagem = `Seu pedido foi confirmado! Código: ${codigo} - Retire na loja ${nomeRestaurante}.`;
    
    try {
        // Enviar por email se disponível
        if (cliente.email) {
            await emailService.enviarEmail(
                cliente.email,
                'Pedido confirmado - World Bite',
                mensagem
            );
        }
        
        // TODO: Integrar com Vonage para SMS quando cliente.telefone estiver disponível
        if (cliente.telefone) {
            console.log(`📱 SMS para ${cliente.telefone}: ${mensagem}`);
        }
        
        console.log(`📧 Notificação enviada: ${mensagem}`);
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
};

// =======================================================
// ROTA 0: CRIAR PEDIDO GENÉRICO (POST /api/pedidos) - Para Flutter App
// =======================================================
router.post('/', async (req, res) => {
    try {
        const {
            clienteId,
            restauranteId,
            status,
            valorTotal,
            taxaEntrega,
            tipo,
            formaPagamento,
            observacoes,
            itens,
        } = req.body;

        console.log('📥 Recebendo pedido do Flutter:', req.body);

        // Validação básica
        if (!clienteId || !restauranteId || !valorTotal || !itens || itens.length === 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Dados incompletos. clienteId, restauranteId, valorTotal e itens são obrigatórios',
            });
        }

        // Gerar código de retirada se for retirada
        const codigoRetirada = tipo === 'retirada' ? gerarCodigoRetirada() : null;

        // Criar pedido no banco
        const novoPedido = await prisma.pedido.create({
            data: {
                clienteId: parseInt(clienteId),
                restauranteId: parseInt(restauranteId),
                status: status || 'pendente',
                tipoEntrega: tipo || 'entrega',
                valorTotal: parseFloat(valorTotal),
                codigoRetirada,
                observacoes: observacoes || null,
                itens: JSON.stringify(itens), // Salvar itens como JSON
            },
            include: {
                cliente: {
                    select: { nome: true, email: true, telefone: true }
                },
                restaurante: {
                    select: { nome: true }
                }
            }
        });

        console.log('✅ Pedido criado:', novoPedido.id);

        res.status(201).json({
            sucesso: true,
            pedido: novoPedido,
            mensagem: `Pedido #${novoPedido.id} criado com sucesso!`,
        });
    } catch (error) {
        console.error('❌ Erro ao criar pedido:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro ao criar pedido',
            detalhes: error.message,
        });
    }
});

// =======================================================
// ROTA 1: FINALIZAR PEDIDO (POST /api/pedidos/finalizar)
// =======================================================
router.post('/finalizar', async (req, res) => {
    try {
        const { 
            clienteId, 
            restauranteId, 
            tipoEntrega, 
            itens, 
            valorTotal, 
            observacoes 
        } = req.body;

        // Validações
        if (!clienteId || !restauranteId || !tipoEntrega || !itens || !valorTotal) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios: clienteId, restauranteId, tipoEntrega, itens, valorTotal' 
            });
        }

        let codigoRetirada = null;
        
        // Gerar código apenas se for retirada na loja
        if (tipoEntrega === 'retirada') {
            codigoRetirada = gerarCodigoRetirada();
        }

        // Criar pedido no banco
        const novoPedido = await prisma.pedido.create({
            data: {
                clienteId: parseInt(clienteId),
                restauranteId: parseInt(restauranteId),
                tipoEntrega,
                codigoRetirada,
                status: 'pendente',
                itens,
                valorTotal: parseFloat(valorTotal),
                observacoes
            },
            include: {
                cliente: {
                    select: { nome: true, email: true, telefone: true }
                },
                restaurante: {
                    select: { nome: true }
                }
            }
        });

        // Enviar notificação se for retirada
        if (tipoEntrega === 'retirada' && codigoRetirada) {
            await enviarNotificacao(
                novoPedido.cliente,
                codigoRetirada,
                novoPedido.restaurante.nome
            );
        }

        res.status(201).json({
            sucesso: true,
            pedido: novoPedido,
            mensagem: tipoEntrega === 'retirada' 
                ? `Pedido criado! Código de retirada: ${codigoRetirada}` 
                : 'Pedido criado para entrega!'
        });

    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        res.status(500).json({ error: 'Erro interno ao finalizar pedido' });
    }
});

// =======================================================
// ROTA 2: LISTAR PEDIDOS PENDENTES PARA RESTAURANTE
// =======================================================
router.get('/', async (req, res) => {
    try {
        const { restauranteId } = req.query;

        if (!restauranteId) {
            return res.status(400).json({ error: 'restauranteId é obrigatório' });
        }

        const pedidos = await prisma.pedido.findMany({
            where: {
                restauranteId: parseInt(restauranteId),
                status: {
                    in: ['pendente', 'aceito', 'pronto']
                }
            },
            include: {
                cliente: {
                    select: { nome: true, telefone: true, email: true }
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        // Transformar para o formato esperado pelo frontend
        const pedidosFormatados = pedidos.map(p => ({
            id: p.id,
            cliente: p.cliente.nome,
            itens: Array.isArray(p.itens) ? p.itens : [],
            total: parseFloat(p.valorTotal),
            tipoEntrega: p.tipoEntrega,
            codigoRetirada: p.codigoRetirada,
            status: p.status,
            observacoes: p.observacoes,
            criadoEm: p.criadoEm
        }));

        res.json(pedidosFormatados);

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar pedidos' });
    }
});

// =======================================================
// ROTA 3: ACEITAR PEDIDO (POST /api/pedidos/:id/aceitar)
// =======================================================
router.post('/:id/aceitar', async (req, res) => {
    try {
        const pedidoId = parseInt(req.params.id);

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: 'aceito' }
        });

        res.json({
            sucesso: true,
            pedido: pedidoAtualizado,
            mensagem: 'Pedido aceito com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao aceitar pedido:', error);
        res.status(500).json({ error: 'Erro interno ao aceitar pedido' });
    }
});

// =======================================================
// ROTA 4: RECUSAR PEDIDO (POST /api/pedidos/:id/recusar)
// =======================================================
router.post('/:id/recusar', async (req, res) => {
    try {
        const pedidoId = parseInt(req.params.id);

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: 'recusado' }
        });

        res.json({
            sucesso: true,
            pedido: pedidoAtualizado,
            mensagem: 'Pedido recusado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao recusar pedido:', error);
        res.status(500).json({ error: 'Erro interno ao recusar pedido' });
    }
});

// =======================================================
// ROTA 5: MARCAR COMO PRONTO (POST /api/pedidos/:id/pronto)
// =======================================================
router.post('/:id/pronto', async (req, res) => {
    try {
        const pedidoId = parseInt(req.params.id);

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: 'pronto' }
        });

        res.json({
            sucesso: true,
            pedido: pedidoAtualizado,
            mensagem: 'Pedido marcado como pronto!'
        });

    } catch (error) {
        console.error('Erro ao marcar pedido como pronto:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar pedido' });
    }
});

// =======================================================
// ROTA 6: CONFIRMAR RETIRADA (POST /api/pedidos/confirmar-retirada)
// =======================================================
router.post('/confirmar-retirada', async (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({ error: 'Código de retirada é obrigatório' });
        }

        // Buscar pedido pelo código
        const pedido = await prisma.pedido.findFirst({
            where: {
                codigoRetirada: codigo,
                status: 'pronto'
            },
            include: {
                cliente: { select: { nome: true } },
                restaurante: { select: { nome: true } }
            }
        });

        if (!pedido) {
            return res.status(404).json({ 
                error: 'Código inválido ou pedido não está pronto para retirada' 
            });
        }

        // Atualizar status para retirado
        const pedidoRetirado = await prisma.pedido.update({
            where: { id: pedido.id },
            data: { status: 'retirado' }
        });

        res.json({
            sucesso: true,
            pedido: pedidoRetirado,
            cliente: pedido.cliente.nome,
            mensagem: 'Pedido retirado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao confirmar retirada:', error);
        res.status(500).json({ error: 'Erro interno ao confirmar retirada' });
    }
});

// =======================================================
// ROTA 7: LISTAR PEDIDOS PARA RETIRADA (GET /api/pedidos/retirada)
// =======================================================
router.get('/retirada', async (req, res) => {
    try {
        const { restauranteId } = req.query;

        if (!restauranteId) {
            return res.status(400).json({ error: 'restauranteId é obrigatório' });
        }

        const pedidosRetirada = await prisma.pedido.findMany({
            where: {
                restauranteId: parseInt(restauranteId),
                tipoEntrega: 'retirada',
                status: {
                    in: ['pronto', 'retirado']
                }
            },
            include: {
                cliente: {
                    select: { nome: true }
                }
            },
            orderBy: { atualizadoEm: 'desc' }
        });

        const pedidosFormatados = pedidosRetirada.map(p => ({
            id: p.id,
            cliente: p.cliente.nome,
            codigoRetirada: p.codigoRetirada,
            status: p.status,
            criadoEm: p.criadoEm,
            atualizadoEm: p.atualizadoEm
        }));

        res.json(pedidosFormatados);

    } catch (error) {
        console.error('Erro ao buscar pedidos para retirada:', error);
        res.status(500).json({ error: 'Erro interno ao buscar pedidos' });
    }
});

module.exports = router;
