const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas públicas
router.post('/send-code', authController.sendCode);
router.post('/verify-code', authController.verifyCode); 
router.post('/login', authController.login); // Agora login é com email + código
router.post('/register', authController.register); // Completar dados após verificação

// Rotas protegidas (precisam de autenticação)
router.get('/profile', authMiddleware, authController.profile);

module.exports = router;
