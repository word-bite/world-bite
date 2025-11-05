// routes/pagamentos.js
const express = require('express');
const router = express.Router();
const mercadopagoClient = require('../config/mercadopago');
const { Preference, Payment } = require('mercadopago');

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

    // Criar instância do Preference
    const preference = new Preference(mercadopagoClient);

    console.log('📊 Criando preferência de pagamento...');
    console.log('Items:', items);

    // Preparar URLs de retorno
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    // Criar preferência de pagamento
    const preferenceData = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        currency_id: 'BRL'
      })),
      payer: payer || {},
      back_urls: {
        success: `${frontendUrl}/pagamento/sucesso`,
        failure: `${frontendUrl}/pagamento/falha`,
        pending: `${frontendUrl}/pagamento/pendente`
      },
      // Remover auto_return para PIX funcionar corretamente
      // auto_return: 'approved',
      notification_url: `${backendUrl}/api/pagamentos/webhook`,
      metadata: metadata || {},
      statement_descriptor: 'WORLD BITE',
      external_reference: `pedido_${Date.now()}`
    };

    console.log('📤 Enviando preferência para MP:', JSON.stringify({
      ...preferenceData,
      items: preferenceData.items.map(i => ({ ...i, unit_price: 'R$ ' + i.unit_price }))
    }, null, 2));

    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', response.id);

    res.json({
      sucesso: true,
      preference_id: response.id,
      init_point: response.init_point, // URL para checkout padrão
      sandbox_init_point: response.sandbox_init_point, // URL para sandbox
      external_reference: response.external_reference
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
  console.log('\n🚀 ========== PROCESSANDO PAGAMENTO ==========');
  console.log('📥 Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      transaction_amount, 
      token, 
      description, 
      installments, 
      payment_method_id,
      payer 
    } = req.body;

    console.log('📊 STEP 1 - Validando dados obrigatórios');
    console.log('- transaction_amount:', transaction_amount);
    console.log('- token:', token ? token.substring(0, 20) + '...' : 'AUSENTE');
    console.log('- payment_method_id:', payment_method_id);

    // Validação
    if (!transaction_amount || !token || !payment_method_id) {
      console.error('❌ Validação falhou - dados incompletos');
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados de pagamento incompletos',
        detalhes: {
          transaction_amount: !!transaction_amount,
          token: !!token,
          payment_method_id: !!payment_method_id
        }
      });
    }

    console.log('📊 STEP 2 - Criando instância do Payment');
    // Criar instância do Payment
    const payment = new Payment(mercadopagoClient);
    console.log('✅ Instância criada');

    console.log('📊 STEP 3 - Preparando dados do pagamento');
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
    console.log('Dados preparados:', JSON.stringify({
      ...payment_data,
      token: payment_data.token.substring(0, 20) + '...'
    }, null, 2));

    console.log('📊 STEP 4 - Enviando para Mercado Pago API');
    let response;
    try {
      response = await payment.create({ body: payment_data });
      console.log('✅ Resposta da API recebida:', JSON.stringify(response, null, 2));
    } catch (mpError) {
      console.error('❌ ERRO na API do Mercado Pago:', {
        message: mpError.message,
        cause: mpError.cause,
        status: mpError.status,
        error: mpError
      });
      throw mpError;
    }

    console.log('📊 STEP 5 - Processando resposta');
    console.log('✅✅✅ Pagamento processado com sucesso!');
    console.log('- ID:', response.id);
    console.log('- Status:', response.status);
    console.log('- Status Detail:', response.status_detail);

    const responseData = {
      sucesso: true,
      payment_id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      external_reference: response.external_reference
    };

    console.log('📤 Enviando resposta:', JSON.stringify(responseData, null, 2));
    console.log('========== FIM PROCESSAMENTO ==========\n');

    res.json(responseData);

  } catch (error) {
    console.error('❌❌❌ ERRO GERAL ao processar pagamento:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      status: error.status,
      error: error
    });
    console.log('========== FIM PROCESSAMENTO (COM ERRO) ==========\n');
    
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao processar pagamento',
      detalhes: error.message,
      status_code: error.status || 500
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
      
      // Criar instância do Payment
      const payment = new Payment(mercadopagoClient);
      
      // Buscar informações do pagamento
      const paymentInfo = await payment.get({ id: paymentId });
      
      console.log('💳 Status do pagamento:', paymentInfo.status);
      console.log('📝 Referência externa:', paymentInfo.external_reference);

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

    // Criar instância do Payment
    const payment = new Payment(mercadopagoClient);
    const paymentInfo = await payment.get({ id: payment_id });

    res.json({
      sucesso: true,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      transaction_amount: paymentInfo.transaction_amount,
      date_approved: paymentInfo.date_approved,
      external_reference: paymentInfo.external_reference
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
    const { PaymentMethod } = require('mercadopago');
    const paymentMethod = new PaymentMethod(mercadopagoClient);
    
    const paymentMethods = await paymentMethod.get();

    res.json({
      sucesso: true,
      metodos: paymentMethods
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
