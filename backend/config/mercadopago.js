// Configuração do Mercado Pago para ambiente de desenvolvimento
const mercadopago = require('mercadopago');

// Configurar com access token de teste
// IMPORTANTE: Substitua pelo seu token de teste do Mercado Pago
// Obtenha em: https://www.mercadopago.com.br/developers/panel/credentials
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN_TEST || 'TEST-YOUR-ACCESS-TOKEN-HERE'
});

module.exports = mercadopago;
