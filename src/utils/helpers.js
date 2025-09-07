const crypto = require('crypto');

// Utility functions
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const minutesToMs = (minutes) => minutes * 60 * 1000;
const hoursToMs = (hours) => hours * 60 * 60 * 1000;
const daysToMs = (days) => days * 24 * 60 * 60 * 1000;

const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove non-numeric characters
  cpf = cpf.replace(/\D/g, '');
  
  // Check if it has 11 digits
  if (cpf.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

const formatCPF = (cpf) => {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

module.exports = {
  generateVerificationCode,
  generateSecureToken,
  minutesToMs,
  hoursToMs,
  daysToMs,
  validateCPF,
  formatCPF
};
