// backend/routes/pedidos.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const notaFiscalService = require('../services/notaFiscalService');

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
// ROTA -1: LISTAR TODOS OS PEDIDOS PÚBLICOS (GET /publico) - SEM AUTENTICAÇÃO
// =======================================================
router.get('/publico', async (req, res) => {
    try {
        const { status, restauranteId } = req.query;

        console.log('📋 Listando pedidos públicos (sem autenticação)');

        const where = {};
        if (status) where.status = status;
        if (restauranteId) where.restauranteId = parseInt(restauranteId);

        const pedidos = await prisma.pedido.findMany({
            where,
            orderBy: { criadoEm: 'desc' },
            include: {
                cliente: {
                    select: { nome: true, email: true, telefone: true }
                },
                restaurante: {
                    select: { nome: true, endereco: true }
                }
            }
        });

        // Formatar pedidos
        const pedidosFormatados = pedidos.map(p => ({
            id: p.id,
            clienteId: p.clienteId,
            restauranteId: p.restauranteId,
            cliente: p.cliente.nome,
            restaurante: p.restaurante.nome,
            status: p.status,
            valorTotal: parseFloat(p.valorTotal),
            taxaEntrega: parseFloat(p.taxaEntrega || 0),
            tipoEntrega: p.tipoEntrega,
            codigoRetirada: p.codigoRetirada,
            observacoes: p.observacoes,
            itens: p.itens ? JSON.parse(p.itens) : [],
            criadoEm: p.criadoEm,
            atualizadoEm: p.atualizadoEm
        }));

        console.log(`✅ ${pedidosFormatados.length} pedidos encontrados`);
        res.json({ sucesso: true, pedidos: pedidosFormatados });
        
    } catch (error) {
        console.error('❌ Erro ao listar pedidos públicos:', error);
        res.status(500).json({ sucesso: false, erro: 'Erro ao buscar pedidos' });
    }
});

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

        // ✅ SEMPRE gerar código de retirada (4 dígitos)
        const codigoRetirada = gerarCodigoRetirada();
        console.log(`🔢 Código de retirada gerado: ${codigoRetirada}`);

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
    let caminhoNF = null;
    
    try {
        console.log('📥 Recebendo pedido para finalizar:', JSON.stringify(req.body, null, 2));
        
        const { 
            clienteId, 
            restauranteId, 
            tipoEntrega, 
            itens, 
            valorTotal,
            taxaEntrega,
            observacoes,
            cliente: dadosCliente,
            endereco,
            cpfCnpjNota
        } = req.body;

        // Validações
        if (!clienteId || !restauranteId || !tipoEntrega || !itens || !valorTotal) {
            console.error('❌ Validação falhou. Dados recebidos:', { clienteId, restauranteId, tipoEntrega, itens: typeof itens, valorTotal });
            return res.status(400).json({ 
                success: false,
                message: 'Campos obrigatórios: clienteId, restauranteId, tipoEntrega, itens, valorTotal' 
            });
        }

        // Validar email do cliente
        if (!dadosCliente || !dadosCliente.email) {
            return res.status(400).json({
                success: false,
                message: 'Email do cliente é obrigatório para envio da nota fiscal'
            });
        }

        // ✅ SEMPRE gerar código de retirada (4 dígitos)
        const codigoRetirada = gerarCodigoRetirada();
        console.log(`🔢 Código de retirada gerado: ${codigoRetirada}`);

        // Criar pedido no banco
        console.log('💾 Criando pedido no banco de dados...');
        const novoPedido = await prisma.pedido.create({
            data: {
                clienteId: parseInt(clienteId),
                restauranteId: parseInt(restauranteId),
                tipoEntrega,
                codigoRetirada,
                status: 'pendente',
                itens: typeof itens === 'string' ? itens : JSON.stringify(itens),
                valorTotal: parseFloat(valorTotal),
                taxaEntrega: parseFloat(taxaEntrega || 0),
                observacoes
            },
            include: {
                cliente: {
                    select: { nome: true, email: true, telefone: true }
                },
                restaurante: {
                    select: { nome: true, cnpj: true, endereco: true, telefone_contato: true }
                }
            }
        });
        
        console.log('✅ Pedido criado com sucesso! ID:', novoPedido.id);

        // ============================================
        // GERAR E ENVIAR NOTA FISCAL
        // ============================================
        try {
            console.log('📄 Gerando nota fiscal...');
            
            // Dados para a nota fiscal
            const dadosNF = {
                pedido: novoPedido,
                cliente: {
                    nome: dadosCliente.nome,
                    email: dadosCliente.email,
                    cpf: dadosCliente.cpf || cpfCnpjNota,
                    telefone: dadosCliente.celular
                },
                restaurante: novoPedido.restaurante,
                itens: novoPedido.itens,
                endereco: endereco
            };

            // Gerar PDF da nota fiscal
            caminhoNF = await notaFiscalService.gerarNotaFiscal(dadosNF);
            console.log('✅ Nota fiscal gerada:', caminhoNF);

            // Enviar nota fiscal por email
            console.log('📧 Enviando nota fiscal por email...');
            const emailResult = await emailService.enviarNotaFiscal(
                dadosCliente.email,
                dadosCliente.nome,
                caminhoNF,
                {
                    id: novoPedido.id,
                    tipoEntrega: novoPedido.tipoEntrega,
                    valorTotal: novoPedido.valorTotal,
                    codigoRetirada: novoPedido.codigoRetirada
                }
            );

            if (emailResult.success) {
                console.log('✅ Nota fiscal enviada com sucesso!');
            } else {
                console.warn('⚠️ Falha no envio da nota fiscal:', emailResult.error);
            }

            // Deletar arquivo temporário após envio
            if (caminhoNF) {
                setTimeout(() => {
                    notaFiscalService.deletarArquivo(caminhoNF);
                }, 5000); // Aguardar 5 segundos antes de deletar
            }

        } catch (errorNF) {
            console.error('❌ Erro ao processar nota fiscal:', errorNF);
            // Não falha o pedido por causa da nota fiscal
        }

        // Enviar notificação tradicional
        await enviarNotificacao(
            novoPedido.cliente,
            codigoRetirada,
            novoPedido.restaurante.nome
        );

        res.status(201).json({
            sucesso: true,
            success: true,
            pedido: novoPedido,
            mensagem: `Pedido criado! Código de retirada: ${codigoRetirada}`,
            message: 'Nota fiscal enviada para o e-mail do cliente.'
        });

    } catch (error) {
        console.error('❌ Erro ao finalizar pedido:', error);
        console.error('Stack trace:', error.stack);
        
        // Limpar arquivo em caso de erro
        if (caminhoNF) {
            notaFiscalService.deletarArquivo(caminhoNF);
        }
        
        res.status(500).json({ 
            success: false,
            sucesso: false,
            error: 'Erro interno ao finalizar pedido',
            message: 'Não foi possível finalizar o pedido. Tente novamente em alguns instantes.',
            detalhes: error.message
        });
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
// ROTA 2.5: ATUALIZAR STATUS DO PEDIDO (PUT /api/pedidos/:id/status) - Para Flutter
// =======================================================
router.put('/:id/status', async (req, res) => {
    try {
        const pedidoId = parseInt(req.params.id);
        const { status } = req.body;

        console.log(`📝 Atualizando status do pedido #${pedidoId} para: ${status}`);

        if (!status) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Status é obrigatório',
            });
        }

        // Validar status
        const statusValidos = [
            'pendente',
            'aceito',
            'preparando',
            'pronto',
            'em_entrega',
            'entregue',
            'cancelado',
            'recusado',
            'retirado'
        ];

        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                sucesso: false,
                erro: `Status inválido. Use: ${statusValidos.join(', ')}`,
            });
        }

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status },
        });

        console.log(`✅ Status do pedido #${pedidoId} atualizado com sucesso`);

        res.json({
            sucesso: true,
            pedido: pedidoAtualizado,
            mensagem: `Status atualizado para ${status}`,
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado',
            });
        }

        res.status(500).json({
            sucesso: false,
            erro: 'Erro ao atualizar status',
            detalhes: error.message,
        });
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

// =======================================================
// ROTA 8: LISTAR PEDIDOS DO CLIENTE (GET /api/pedidos/cliente/:clienteId)
// =======================================================
router.get('/cliente/:clienteId', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.clienteId);

        console.log(`📋 Buscando pedidos do cliente #${clienteId}`);

        const pedidos = await prisma.pedido.findMany({
            where: { clienteId },
            include: {
                restaurante: {
                    select: { 
                        nome: true, 
                        endereco: true,
                        telefone_contato: true
                    }
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        const pedidosFormatados = pedidos.map(p => ({
            id: p.id,
            restaurante: p.restaurante.nome,
            restauranteEndereco: p.restaurante.endereco,
            restauranteTelefone: p.restaurante.telefone_contato,
            status: p.status,
            tipoEntrega: p.tipoEntrega,
            valorTotal: parseFloat(p.valorTotal),
            taxaEntrega: parseFloat(p.taxaEntrega || 0),
            codigoRetirada: p.codigoRetirada,
            observacoes: p.observacoes,
            itens: p.itens ? JSON.parse(p.itens) : [],
            avaliacao: p.avaliacao,
            comentarioAvaliacao: p.comentarioAvaliacao,
            criadoEm: p.criadoEm,
            atualizadoEm: p.atualizadoEm
        }));

        console.log(`✅ ${pedidosFormatados.length} pedidos encontrados`);
        res.json({ sucesso: true, pedidos: pedidosFormatados });

    } catch (error) {
        console.error('❌ Erro ao buscar pedidos do cliente:', error);
        res.status(500).json({ 
            sucesso: false, 
            erro: 'Erro ao buscar pedidos' 
        });
    }
});

// =======================================================
// ROTA 9: AVALIAR PEDIDO (POST /api/pedidos/:id/avaliar)
// =======================================================
router.post('/:id/avaliar', async (req, res) => {
    try {
        const pedidoId = parseInt(req.params.id);
        const { avaliacao, comentario } = req.body;

        console.log(`⭐ Avaliando pedido #${pedidoId}: ${avaliacao} estrelas`);

        // Validação
        if (!avaliacao || avaliacao < 1 || avaliacao > 5) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Avaliação deve ser entre 1 e 5 estrelas'
            });
        }

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: {
                avaliacao: parseInt(avaliacao),
                comentarioAvaliacao: comentario || null
            }
        });

        console.log(`✅ Pedido #${pedidoId} avaliado com sucesso`);

        res.json({
            sucesso: true,
            pedido: pedidoAtualizado,
            mensagem: 'Avaliação registrada com sucesso!'
        });

    } catch (error) {
        console.error('❌ Erro ao avaliar pedido:', error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }

        res.status(500).json({
            sucesso: false,
            erro: 'Erro ao registrar avaliação'
        });
    }
});

module.exports = router;
