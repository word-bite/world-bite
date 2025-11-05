// Configuração do Mercado Pago para ambiente de desenvolvimento
const { MercadoPagoConfig } = require('mercadopago');

// Configurar com access token de teste
// IMPORTANTE: Substitua pelo seu token de teste do Mercado Pago
// Obtenha em: https://www.mercadopago.com.br/developers/panel/credentials
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN_TEST || 'TEST-YOUR-ACCESS-TOKEN-HERE',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

module.exports = client;
