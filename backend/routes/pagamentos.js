// routes/pagamentos.js
const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');

// 💳 Criar preferência de pagamento
router.post('/criar-preferencia', async (req, res) => {
  try {
    const { items, payer, back_urls, metadata } = req.body;

    // Validação básica
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Items são obrigatórios'
      });
    }

    // Criar preferência de pagamento
    const preference = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        currency_id: 'BRL'
      })),
      payer: payer || {},
      back_urls: back_urls || {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pagamento/falha`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pagamento/pendente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/pagamentos/webhook`,
      metadata: metadata || {},
      statement_descriptor: 'WORLD BITE',
      external_reference: `pedido_${Date.now()}`
    };

    const response = await mercadopago.preferences.create(preference);

    console.log('✅ Preferência criada:', response.body.id);

    res.json({
      sucesso: true,
      preference_id: response.body.id,
      init_point: response.body.init_point, // URL para checkout padrão
      sandbox_init_point: response.body.sandbox_init_point, // URL para sandbox
      external_reference: response.body.external_reference
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao criar preferência de pagamento',
      detalhes: error.message
    });
  }
});

// 💰 Processar pagamento com cartão de crédito
router.post('/processar-pagamento', async (req, res) => {
  try {
    const { 
      transaction_amount, 
      token, 
      description, 
      installments, 
      payment_method_id,
      payer 
    } = req.body;

    // Validação
    if (!transaction_amount || !token || !payment_method_id) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados de pagamento incompletos'
      });
    }

    const payment_data = {
      transaction_amount: parseFloat(transaction_amount),
      token: token,
      description: description || 'Pedido World Bite',
      installments: parseInt(installments) || 1,
      payment_method_id: payment_method_id,
      payer: payer || {},
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/pagamentos/webhook`,
      statement_descriptor: 'WORLD BITE',
      external_reference: `pedido_${Date.now()}`
    };

    const response = await mercadopago.payment.create(payment_data);

    console.log('✅ Pagamento processado:', response.body.id);

    res.json({
      sucesso: true,
      payment_id: response.body.id,
      status: response.body.status,
      status_detail: response.body.status_detail,
      external_reference: response.body.external_reference
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao processar pagamento',
      detalhes: error.message
    });
  }
});

// 🔔 Webhook para notificações do Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📬 Webhook recebido:', type);

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar informações do pagamento
      const payment = await mercadopago.payment.get(paymentId);
      
      console.log('💳 Status do pagamento:', payment.body.status);
      console.log('📝 Referência externa:', payment.body.external_reference);

      // Aqui você pode atualizar o status do pedido no banco de dados
      // Exemplo: await prisma.pedido.update({ ... })

      res.status(200).send('OK');
    } else {
      res.status(200).send('OK');
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).send('ERROR');
  }
});

// 🔍 Consultar status de pagamento
router.get('/status/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;

    const payment = await mercadopago.payment.get(payment_id);

    res.json({
      sucesso: true,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      transaction_amount: payment.body.transaction_amount,
      date_approved: payment.body.date_approved,
      external_reference: payment.body.external_reference
    });

  } catch (error) {
    console.error('❌ Erro ao consultar pagamento:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao consultar pagamento'
    });
  }
});

// 📋 Obter métodos de pagamento disponíveis
router.get('/metodos-pagamento', async (req, res) => {
  try {
    const paymentMethods = await mercadopago.payment_methods.listAll();

    res.json({
      sucesso: true,
      metodos: paymentMethods.body
    });

  } catch (error) {
    console.error('❌ Erro ao buscar métodos:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao buscar métodos de pagamento'
    });
  }
});

module.exports = router;
