const authService = require('../services/authService');
const Joi = require('joi');

// Validações
const sendCodeValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  })
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Código deve ter 6 dígitos',
    'string.pattern.base': 'Código deve conter apenas números'
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  cpf: Joi.string().min(11).optional().messages({
    'string.min': 'CPF deve ter 11 dígitos'
  })
});

const verifyCodeValidation = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Código deve ter 6 dígitos',
    'string.pattern.base': 'Código deve conter apenas números'
  })
});

const updateProfileValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  cpf: Joi.string().min(11).optional()
});

/**
 * Enviar código de verificação
 */
const sendCode = async (req, res) => {
  try {
    const { error } = sendCodeValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(detail => detail.message).join(', ')
      });
    }

    const { email } = req.body;
    const result = await authService.sendVerificationCode(email);
    res.json(result);
  } catch (error) {
    console.error('Erro em sendCode:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

/**
 * Login com email e código (com dados opcionais)
 */
const login = async (req, res) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(detail => detail.message).join(', ')
      });
    }

    const { email, code, name, cpf } = req.body;
    const userData = {};
    if (name) userData.name = name;
    if (cpf) userData.cpf = cpf;

    const result = await authService.loginWithCode(email, code, userData);
    res.json(result);
  } catch (error) {
    console.error('Erro em login:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao fazer login'
    });
  }
};

/**
 * Verificar código (sem fazer login)
 */
const verifyCode = async (req, res) => {
  try {
    const { error } = verifyCodeValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(detail => detail.message).join(', ')
      });
    }

    const { email, code } = req.body;
    const result = await authService.verifyCode(email, code);
    res.json(result);
  } catch (error) {
    console.error('Erro em verifyCode:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao verificar código'
    });
  }
};

/**
 * Completar cadastro (atualizar dados após verificação)
 */
const register = async (req, res) => {
  try {
    const { error } = updateProfileValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(detail => detail.message).join(', ')
      });
    }

    const { email, name, cpf } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const result = await authService.completeRegistration(email, name, cpf);
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro em register:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao completar cadastro'
    });
  }
};

/**
 * Perfil do usuário
 */
const profile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json({
      success: true,
      message: 'Perfil obtido com sucesso',
      user
    });
  } catch (error) {
    console.error('Erro em profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar perfil'
    });
  }
};

module.exports = {
  sendCode,
  login,
  verifyCode,
  register,
  profile
};
