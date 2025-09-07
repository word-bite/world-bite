require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Importações locais
const authRoutes = require('./routes/authRoutes');
// const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básicos
app.use(cors());
app.use(express.json());

// Rate limiting básico
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use(limiter);

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'WoldBite API - Sistema de Autenticação',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Middleware de erro básico
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
