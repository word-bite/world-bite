// backend/middlewares/authUsuario.js
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ sucesso: false, erro: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ sucesso: false, erro: 'Token inválido' });

  // Formato antigo: token_<userId>_<timestamp>
  const parts = token.split('_');
  if (parts.length < 2) return res.status(400).json({ sucesso: false, erro: 'Token inválido' });

  const userId = parseInt(parts[1]);
  if (isNaN(userId)) return res.status(400).json({ sucesso: false, erro: 'Token inválido' });

  req.userId = userId;
  next();
};
