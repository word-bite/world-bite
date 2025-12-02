// backend/routes/relatorios.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authRestaurante } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// =======================================================
// ROTA: RELATÓRIOS GERAIS DA PLATAFORMA (PÚBLICO)
// =======================================================
router.get('/plataforma', async (req, res) => {
    try {
        console.log('📊 Buscando relatórios da plataforma (público)');

        // 1. Total de Pedidos e Estatísticas
        const totalPedidos = await prisma.pedido.count();
        const pedidosPorStatus = await prisma.pedido.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const pedidosConcluidos = await prisma.pedido.count({
            where: { status: { in: ['entregue', 'retirado'] } }
        });

        const pedidosCancelados = await prisma.pedido.count({
            where: { status: 'cancelado' }
        });

        const pedidosPendentes = await prisma.pedido.count({
            where: { status: 'pendente' }
        });

        // 2. Valor Total em Vendas
        const vendas = await prisma.pedido.aggregate({
            _sum: { valorTotal: true },
            where: { status: { in: ['entregue', 'retirado'] } }
        });

        const valorTotalVendas = parseFloat(vendas._sum.valorTotal || 0);

        // 3. Ticket Médio
        const ticketMedio = pedidosConcluidos > 0 
            ? valorTotalVendas / pedidosConcluidos 
            : 0;

        // 4. Total de Pratos
        const totalPratos = await prisma.prato.count();
        const pratosDisponiveis = await prisma.prato.count({
            where: { disponivel: true }
        });
        const pratosIndisponiveis = await prisma.prato.count({
            where: { disponivel: false }
        });

        // 5. Pratos por Categoria
        const pratosPorCategoria = await prisma.prato.groupBy({
            by: ['categoria'],
            _count: { id: true },
        });

        // 6. Total de Restaurantes
        const totalRestaurantes = await prisma.restaurante.count();
        const restaurantesAtivos = await prisma.restaurante.count({
            where: { ativo: true }
        });
        const restaurantesInativos = await prisma.restaurante.count({
            where: { ativo: false }
        });

        // 7. Total de Usuários
        const totalUsuarios = await prisma.usuario.count();
        const usuariosAtivos = await prisma.usuario.count({
            where: { ativo: true }
        });

        // 8. Top 5 Restaurantes por Pedidos
        const topRestaurantes = await prisma.pedido.groupBy({
            by: ['restauranteId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        const restaurantesComNome = await Promise.all(
            topRestaurantes.map(async (item) => {
                const restaurante = await prisma.restaurante.findUnique({
                    where: { id: item.restauranteId },
                    select: { nome: true, nota_media: true }
                });
                return {
                    id: item.restauranteId,
                    nome: restaurante?.nome || 'Desconhecido',
                    totalPedidos: item._count.id,
                    notaMedia: parseFloat(restaurante?.nota_media || 0)
                };
            })
        );

        // 9. Top 5 Pratos Mais Pedidos (analisando o JSON dos pedidos)
        const pedidosComItens = await prisma.pedido.findMany({
            where: { status: { in: ['entregue', 'retirado'] } },
            select: { itens: true }
        });

        const contagemPratos = {};
        pedidosComItens.forEach(pedido => {
            try {
                const itens = JSON.parse(pedido.itens);
                itens.forEach(item => {
                    if (item.nome) {
                        contagemPratos[item.nome] = (contagemPratos[item.nome] || 0) + item.quantidade;
                    }
                });
            } catch (e) {
                console.error('Erro ao parsear itens:', e);
            }
        });

        const topPratos = Object.entries(contagemPratos)
            .map(([nome, quantidade]) => ({ nome, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5);

        // 10. Pedidos por Tipo de Entrega
        const pedidosPorTipoEntrega = await prisma.pedido.groupBy({
            by: ['tipoEntrega'],
            _count: { id: true },
        });

        // 11. Últimos 10 Pedidos
        const ultimosPedidos = await prisma.pedido.findMany({
            take: 10,
            orderBy: { criadoEm: 'desc' },
            include: {
                restaurante: {
                    select: { nome: true }
                },
                cliente: {
                    select: { nome: true, email: true }
                }
            }
        });

        const ultimosPedidosFormatados = ultimosPedidos.map(p => ({
            id: p.id,
            restaurante: p.restaurante.nome,
            cliente: p.cliente.nome,
            email: p.cliente.email,
            valor: parseFloat(p.valorTotal),
            status: p.status,
            tipoEntrega: p.tipoEntrega,
            criadoEm: p.criadoEm
        }));

        // 12. Pedidos por Dia (últimos 7 dias)
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

        const pedidosPorDia = await prisma.$queryRaw`
            SELECT 
                DATE(criado_em) as dia,
                COUNT(*)::int as total,
                SUM(valor_total)::float as valor
            FROM pedidos
            WHERE criado_em >= ${seteDiasAtras}
            GROUP BY DATE(criado_em)
            ORDER BY dia DESC
        `;

        // 13. Taxa de Conversão (pedidos concluídos / total)
        const taxaConversao = totalPedidos > 0 
            ? (pedidosConcluidos / totalPedidos) * 100 
            : 0;

        // Montar resposta
        const relatorios = {
            resumo: {
                totalPedidos,
                pedidosConcluidos,
                pedidosCancelados,
                pedidosPendentes,
                valorTotalVendas: valorTotalVendas.toFixed(2),
                ticketMedio: ticketMedio.toFixed(2),
                taxaConversao: taxaConversao.toFixed(1),
                totalPratos,
                pratosDisponiveis,
                pratosIndisponiveis,
                totalRestaurantes,
                restaurantesAtivos,
                restaurantesInativos,
                totalUsuarios,
                usuariosAtivos
            },
            graficos: {
                pedidosPorStatus: pedidosPorStatus.map(p => ({
                    status: p.status,
                    quantidade: p._count.id
                })),
                pratosPorCategoria: pratosPorCategoria.map(p => ({
                    categoria: p.categoria,
                    quantidade: p._count.id
                })),
                pedidosPorTipoEntrega: pedidosPorTipoEntrega.map(p => ({
                    tipo: p.tipoEntrega,
                    quantidade: p._count.id
                })),
                pedidosPorDia: pedidosPorDia.map(p => ({
                    dia: p.dia,
                    total: p.total,
                    valor: parseFloat(p.valor || 0).toFixed(2)
                }))
            },
            rankings: {
                topRestaurantes: restaurantesComNome,
                topPratos
            },
            recentes: {
                ultimosPedidos: ultimosPedidosFormatados
            }
        };

        console.log('✅ Relatórios gerados com sucesso');
        res.status(200).json(relatorios);

    } catch (error) {
        console.error('❌ Erro ao gerar relatórios:', error);
        res.status(500).json({ 
            error: 'Erro ao gerar relatórios da plataforma',
            details: error.message 
        });
    }
});

// =======================================================
// ROTA: LISTAR TODOS OS PEDIDOS
// =======================================================
router.get('/pedidos', async (req, res) => {
    try {
        const { status, limit = 100, offset = 0 } = req.query;

        const where = status ? { status } : {};

        const pedidos = await prisma.pedido.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { criadoEm: 'desc' },
            include: {
                restaurante: {
                    select: { id: true, nome: true, telefone_contato: true }
                },
                cliente: {
                    select: { id: true, nome: true, email: true, telefone: true }
                }
            }
        });

        const total = await prisma.pedido.count({ where });

        const pedidosFormatados = pedidos.map(p => ({
            id: p.id,
            restaurante: {
                id: p.restaurante.id,
                nome: p.restaurante.nome,
                telefone: p.restaurante.telefone_contato
            },
            cliente: {
                id: p.cliente.id,
                nome: p.cliente.nome,
                email: p.cliente.email,
                telefone: p.cliente.telefone
            },
            itens: JSON.parse(p.itens),
            valorTotal: parseFloat(p.valorTotal),
            status: p.status,
            tipoEntrega: p.tipoEntrega,
            enderecoEntrega: p.enderecoEntrega,
            codigoRetirada: p.codigoRetirada,
            observacoes: p.observacoes,
            criadoEm: p.criadoEm,
            atualizadoEm: p.atualizadoEm
        }));

        res.json({
            pedidos: pedidosFormatados,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});

// =======================================================
// ROTA: LISTAR TODOS OS PRATOS
// =======================================================
router.get('/pratos', async (req, res) => {
    try {
        const { disponivel, categoria, limit = 100, offset = 0 } = req.query;

        const where = {};
        if (disponivel !== undefined) {
            where.disponivel = disponivel === 'true';
        }
        if (categoria) {
            where.categoria = categoria;
        }

        const pratos = await prisma.prato.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { nome: 'asc' },
            include: {
                restaurante: {
                    select: { id: true, nome: true }
                }
            }
        });

        const total = await prisma.prato.count({ where });

        const pratosFormatados = pratos.map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            preco: parseFloat(p.preco),
            categoria: p.categoria,
            disponivel: p.disponivel,
            urlImagem: p.urlImagem,
            restaurante: {
                id: p.restaurante.id,
                nome: p.restaurante.nome
            },
            criadoEm: p.criadoEm
        }));

        res.json({
            pratos: pratosFormatados,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar pratos:', error);
        res.status(500).json({ error: 'Erro ao buscar pratos' });
    }
});

// =======================================================
// ROTA: LISTAR TODOS OS RESTAURANTES
// =======================================================
router.get('/restaurantes', async (req, res) => {
    try {
        const { ativo, limit = 100, offset = 0 } = req.query;

        const where = {};
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }

        const restaurantes = await prisma.restaurante.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { nome: 'asc' },
            include: {
                _count: {
                    select: {
                        pratos: true,
                        pedidos: true
                    }
                }
            }
        });

        const total = await prisma.restaurante.count({ where });

        const restaurantesFormatados = restaurantes.map(r => ({
            id: r.id,
            nome: r.nome,
            cnpj: r.cnpj,
            descricao: r.descricao,
            endereco: r.endereco,
            telefone: r.telefone_contato,
            email: r.email_contato,
            ativo: r.ativo,
            notaMedia: parseFloat(r.nota_media || 0),
            totalPratos: r._count.pratos,
            totalPedidos: r._count.pedidos,
            criadoEm: r.criadoEm
        }));

        res.json({
            restaurantes: restaurantesFormatados,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar restaurantes:', error);
        res.status(500).json({ error: 'Erro ao buscar restaurantes' });
    }
});

// =======================================================
// ROTA: LISTAR TODOS OS USUÁRIOS
// =======================================================
router.get('/usuarios', async (req, res) => {
    try {
        console.log('👥 Buscando todos os usuários');
        const { ativo, verificado, limit = 100, offset = 0 } = req.query;

        const where = {};
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }
        if (verificado !== undefined) {
            where.verificado = verificado === 'true';
        }

        const usuarios = await prisma.usuario.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { data_criacao: 'desc' },
            include: {
                _count: {
                    select: {
                        pedidos: true
                    }
                }
            }
        });

        const total = await prisma.usuario.count({ where });

        const usuariosFormatados = usuarios.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone,
            ativo: u.ativo,
            verificado: u.verificado,
            emailVerificado: u.email_verificado,
            telefoneVerificado: u.telefone_verificado,
            fotoPerfil: u.fotoPerfil,
            googleId: u.googleId ? '✅ Google' : null,
            facebookId: u.facebook_id ? '✅ Facebook' : null,
            totalPedidos: u._count.pedidos,
            criadoEm: u.data_criacao
        }));

        console.log(`✅ ${usuariosFormatados.length} usuários encontrados`);

        res.json({
            usuarios: usuariosFormatados,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários', details: error.message });
    }
});

module.exports = router;
