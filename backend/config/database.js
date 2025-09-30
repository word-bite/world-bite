const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient({
    log: ['warn', 'error'], // Reduzir logs para evitar spam
    errorFormat: 'minimal'
  });
  
  // Não conectar automaticamente para evitar crash
} catch (error) {
  console.error('❌ Erro ao inicializar Prisma Client:', error.message);
  // Fallback para evitar crash quando não há banco disponível
  prisma = null;
}

module.exports = prisma;
