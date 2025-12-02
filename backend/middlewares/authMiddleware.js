// backend/middlewares/authMiddleware.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// =======================================================
// Middleware para RESTAURANTES 
// =======================================================
const authRestaurante = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('CNPJ ')) {
    return res.status(401).json({ error: 'Acesso negado. CNPJ não fornecido no cabeçalho.' });
  }

  const cnpjComFormato = authHeader.split(' ')[1];
  if (!cnpjComFormato) {
    return res.status(401).json({ error: 'CNPJ inválido.' });
  }

  const cnpjLimpo = cnpjComFormato.replace(/[^\d]/g, '');

  try {
    const restaurante = await prisma.restaurante.findUnique({
      where: { cnpj: cnpjLimpo },
      select: { id: true, nome: true },
    });

    if (!restaurante) {
      return res.status(401).json({ error: 'Restaurante não encontrado.' });
    }

    req.restauranteId = restaurante.id;
    req.restauranteNome = restaurante.nome;
    return next();
  } catch (error) {
    console.error('authRestaurante error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// =======================================================
// Middleware para USUÁRIOS (Clientes)
// Usando token simples do tipo: token_<userId>_<timestamp>
// =======================================================
const authUsuario = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ sucesso: false, erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ sucesso: false, erro: 'Token inválido' });
  }

  try {
    // Dividir token pelo "_" para extrair userId
    const tokenParts = token.split('_');

    if (tokenParts.length < 2) {
      return res.status(401).json({ sucesso: false, erro: 'Token inválido' });
    }

    const userId = parseInt(tokenParts[1]);
    if (isNaN(userId)) {
      return res.status(401).json({ sucesso: false, erro: 'Token inválido' });
    }

    // ======= DEBUG LOGS =======
    console.log('Authorization header recebido:', authHeader);
    console.log('Token extraído:', token);
    console.log('Token partes:', tokenParts);
    console.log('UserId extraído do token:', userId);
    // ===========================

    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    console.log('Usuário encontrado no banco:', usuario); // DEBUG

    if (!usuario || (typeof usuario.ativo !== 'undefined' && !usuario.ativo)) {
      return res.status(401).json({ sucesso: false, erro: 'Usuário inválido ou desativado' });
    }

    req.userId = usuario.id;
    req.user = usuario;
    return next();
  } catch (error) {
    console.error('authUsuario error:', error.message || error);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
  }
};

module.exports = {
  authRestaurante,
  authUsuario,
};
