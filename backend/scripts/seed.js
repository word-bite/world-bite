// backend/scripts/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const usuario = await prisma.usuario.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      nome: 'Cliente Teste',
      email: 'cliente@teste.com',
      telefone: '11999999999',
      email_verificado: true,
      telefone_verificado: true,
      ativo: true
    }
  });

  // Criar restaurante de teste (se não existir)
  const restaurante = await prisma.restaurante.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      nome: 'Restaurante Teste',
      cnpj: '12345678000199',
      descricao: 'Restaurante para testes do sistema',
      endereco: 'Rua Teste, 123 - São Paulo, SP',
      telefone_contato: '11999888777',
      email_contato: 'restaurante@teste.com',
      pais_id: 'Brasil',
      ativo: true
    }
  });

  // Criar alguns pratos de teste
  const pratos = await Promise.all([
    prisma.prato.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nome: 'Hambúrguer Artesanal',
        descricao: 'Hambúrguer com carne 150g, queijo, alface e tomate',
        preco: 25.90,
        categoria: 'PRINCIPAL',
        disponivel: true,
        urlImagem: 'https://example.com/hamburguer.jpg',
        restauranteId: restaurante.id
      }
    }),
    prisma.prato.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nome: 'Batata Frita',
        descricao: 'Porção de batata frita crocante',
        preco: 12.50,
        categoria: 'ENTRADA',
        disponivel: true,
        urlImagem: 'https://example.com/batata.jpg',
        restauranteId: restaurante.id
      }
    })
  ]);

  // Criar pedidos de teste
  const pedidos = await Promise.all([
    prisma.pedido.create({
      data: {
        clienteId: usuario.id,
        restauranteId: restaurante.id,
        tipoEntrega: 'retirada',
        codigoRetirada: '6363',
        status: 'pronto',
        itens: JSON.stringify([
          { nome: 'Hambúrguer Artesanal', preco: 25.90, quantidade: 1 },
          { nome: 'Batata Frita', preco: 12.50, quantidade: 1 }
        ]),
        valorTotal: 38.40,
        observacoes: 'Sem cebola no hambúrguer'
      }
    }),
    prisma.pedido.create({
      data: {
        clienteId: usuario.id,
        restauranteId: restaurante.id,
        tipoEntrega: 'entrega',
        status: 'aceito',
        itens: JSON.stringify([
          { nome: 'Hambúrguer Artesanal', preco: 25.90, quantidade: 2 }
        ]),
        valorTotal: 51.80
      }
    }),
    prisma.pedido.create({
      data: {
        clienteId: usuario.id,
        restauranteId: restaurante.id,
        tipoEntrega: 'retirada',
        codigoRetirada: '1234',
        status: 'pendente',
        itens: JSON.stringify([
          { nome: 'Batata Frita', preco: 12.50, quantidade: 2 }
        ]),
        valorTotal: 25.00
      }
    })
  ]);

  console.log('✅ Seed completo!');
  console.log(`👤 Usuário criado: ${usuario.nome} (ID: ${usuario.id})`);
  console.log(`🏪 Restaurante criado: ${restaurante.nome} (ID: ${restaurante.id})`);
  console.log(`🍽️ Pratos criados: ${pratos.length}`);
  console.log(`📦 Pedidos criados: ${pedidos.length}`);
  
  console.log('\n🔑 Dados para teste:');
  console.log(`CNPJ do restaurante: ${restaurante.cnpj}`);
  console.log(`Códigos de retirada: 6363 (pronto), 1234 (pendente)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
