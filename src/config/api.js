// Configuração da API para PRODUÇÃO (branch main - Vercel)
// Esta branch sempre usa a URL do Vercel em produção
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000'     // Fallback para testes locais da main
  : window.location.origin;      // Produção: usa a mesma origem do Vercel
