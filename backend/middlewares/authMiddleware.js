// backend/middlewares/authMiddleware.js
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// =======================================================
// Middleware para RESTAURANTES (mantive sua lógica original)
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
// Espera header: Authorization: Bearer <JWT>
// Foi ampliado para aceitar id numérico OU email no payload.
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

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não definido');
    return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // DEBUG: log do payload em dev
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[authUsuario] token payload:', payload);
    }

    // tenta várias chaves comuns que podem identificar o usuário no token
    let identifier = payload.id ?? payload.sub ?? payload.userId ?? payload.usuarioId ?? payload.user_id ?? payload.email;

    if (!identifier) {
      return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
    }

    let usuario = null;

    // se identifier for email, busca por email
    if (typeof identifier === 'string' && identifier.includes('@')) {
      usuario = await prisma.usuario.findUnique({
        where: { email: identifier }
      });
    } else if (!isNaN(parseInt(identifier, 10))) {
      // se for numérico, busca por id
      usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(identifier, 10) }
      });
    } else {
      // caso especial: identifier não numérico nem email -> erro claro
      return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
    }

    if (!usuario || (typeof usuario.ativo !== 'undefined' && !usuario.ativo)) {
      return res.status(401).json({ sucesso: false, erro: 'Usuário inválido ou desativado' });
    }

    req.userId = usuario.id;
    req.user = usuario;
    return next();
  } catch (error) {
    console.error('authUsuario error:', error.message || error);
    return res.status(401).json({ sucesso: false, erro: 'Token inválido ou expirado' });
  }
};

module.exports = {
  authRestaurante,
  authUsuario,
};