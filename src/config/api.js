// Configuração da API baseada no ambiente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000'  // Em desenvolvimento, usa localhost
  : window.location.origin;   // Em produção (Vercel), usa a mesma origem (com /api nas rotas)

