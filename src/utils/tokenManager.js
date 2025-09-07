const jwt = require('jsonwebtoken');

const tokenManager = {
  generateToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn });
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', { expiresIn: '7d' });
  },

  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
  }
};

module.exports = tokenManager;
