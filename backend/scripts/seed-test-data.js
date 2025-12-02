// Script para popular o banco com dados de teste
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de dados de teste...');

  try {
    // 0. Verificar se já existe restaurante com este CNPJ
    console.log('\n🔍 Verificando dados existentes...');
    const restauranteExistente = await prisma.restaurante.findUnique({
      where: { cnpj: '12345678000190' },
    });

    let restaurante;
    if (restauranteExistente) {
      console.log('ℹ️ Restaurante já existe, usando dados existentes');
      restaurante = restauranteExistente;
    } else {
      // 1. Criar Restaurante
      console.log('\n📍 Criando restaurante...');
      restaurante = await prisma.restaurante.create({
        data: {
          nome: 'Sabor da Casa',
          cnpj: '12345678000190',
          descricao: 'Comida caseira brasileira com carinho',
          endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
          telefone_contato: '(11) 98765-4321',
          email_contato: 'contato@sabordacasa.com.br',
          pais_id: 'BR',
          horario_abertura: new Date('1970-01-01T11:00:00'),
          horario_fechamento: new Date('1970-01-01T22:00:00'),
        },
      });
      console.log('✅ Restaurante criado:', restaurante.nome);
    }

    // 2. Criar Pratos
    console.log('\n🍽️ Criando pratos...');
    
    // Deletar pratos antigos deste restaurante
    await prisma.prato.deleteMany({
      where: { restauranteId: restaurante.id },
    });
    
    const pratos = await Promise.all([
      prisma.prato.create({
        data: {
          nome: 'Bife Acebolado',
          descricao: 'Arroz soltinho, feijão caldoso, bife acebolado e salada fresca',
          preco: 32.90,
          categoria: 'PRINCIPAL',
          urlImagem: 'https://controlenamao.com.br/blog/wp-content/uploads/2025/02/Como-Montar-um-Restaurante-Prato-Feito-PF_-Guia-em-10-passos.webp',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
      prisma.prato.create({
        data: {
          nome: 'Feijoada Completa',
          descricao: 'Servida com arroz, farofa, couve refogada e laranja',
          preco: 45.00,
          categoria: 'PRINCIPAL',
          urlImagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh04q8NeAdGAiQ8XTDcR7HNSRqNjfLKJa7VQ&s',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
      prisma.prato.create({
        data: {
          nome: 'Strogonoff de Frango',
          descricao: 'Creme leve com champignon, acompanha arroz e batata palha',
          preco: 36.50,
          categoria: 'PRINCIPAL',
          urlImagem: 'https://receitadaboa.com.br/wp-content/uploads/2024/04/iStock-1460067431.jpg',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
      prisma.prato.create({
        data: {
          nome: 'Moqueca Baiana',
          descricao: 'Peixe fresco, leite de coco e dendê, acompanha arroz',
          preco: 49.90,
          categoria: 'PRINCIPAL',
          urlImagem: 'https://www.estadao.com.br/resizer/v2/TFCR7BBZKNPUFNQHCMSMELCLHI.jpg',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
      prisma.prato.create({
        data: {
          nome: 'Pudim de Leite',
          descricao: 'Pudim caseiro cremoso com calda de caramelo',
          preco: 12.00,
          categoria: 'SOBREMESA',
          urlImagem: 'https://cdn.panelinha.com.br/receita/1598892400000-Pudim-de-leite.jpg',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
      prisma.prato.create({
        data: {
          nome: 'Coca-Cola 350ml',
          descricao: 'Refrigerante gelado',
          preco: 5.00,
          categoria: 'BEBIDA',
          urlImagem: 'https://www.imagemhost.com.br/images/2024/01/16/coca-cola-lata.jpg',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
      prisma.prato.create({
        data: {
          nome: 'Suco Natural de Laranja',
          descricao: 'Suco natural 500ml',
          preco: 8.00,
          categoria: 'BEBIDA',
          urlImagem: 'https://img.freepik.com/fotos-gratis/suco-de-laranja_1203-8619.jpg',
          disponivel: true,
          restauranteId: restaurante.id,
        },
      }),
    ]);
    console.log('✅ Pratos criados:', pratos.length);

    // 3. Criar Usuário Cliente
    console.log('\n👤 Criando usuário cliente...');
    
    // Verificar se usuário já existe
    let usuario = await prisma.usuario.findUnique({
      where: { email: 'joao.silva@email.com' },
    });
    
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nome: 'João Silva',
          email: 'joao.silva@email.com',
          telefone: '+5511987654321',
          email_verificado: true,
          telefone_verificado: true,
        },
      });
      console.log('✅ Usuário criado:', usuario.nome);
    } else {
      console.log('ℹ️ Usuário já existe, usando dados existentes');
    }

    // 6. Resumo Final
    console.log('\n📊 RESUMO DOS DADOS CRIADOS:');
    console.log('═══════════════════════════════════════');
    console.log(`🏪 Restaurante: ${restaurante.nome}`);
    console.log(`   CNPJ: ${restaurante.cnpj}`);
    console.log(`   ID: ${restaurante.id}`);
    console.log('');
    console.log(`🍽️ Pratos: ${pratos.length}`);
    pratos.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nome} - R$ ${p.preco.toFixed(2)}`);
    });
    console.log('');
    console.log(`👤 Cliente: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   ID: ${usuario.id}`);
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📱 Dados prontos para testar no Flutter!');
    console.log('\n🔑 Credenciais para Login:');
    console.log(`   Restaurante CNPJ: ${restaurante.cnpj}`);
    console.log(`   Cliente Email: ${usuario.email}`);
    console.log('\n💡 Próximos passos:');
    console.log('   1. Use Prisma Studio para ver os dados: npx prisma studio');
    console.log('   2. Teste as APIs no Postman/Insomnia');
    console.log('   3. Configure o Flutter com a URL: https://world-bite.vercel.app');

  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
