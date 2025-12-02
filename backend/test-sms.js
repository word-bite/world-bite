// backend/test-sms.js
// Script para testar o envio de SMS

require('dotenv').config();
const smsService = require('./services/smsService');

async function testarSMS() {
    console.log('🧪 Testando envio de SMS...\n');
    
    // IMPORTANTE: Substitua pelo seu número de telefone para teste
    const telefone = '+5511999999999'; // Formato internacional
    const codigo = '123456';
    
    console.log('📱 Configurações:');
    console.log(`API Key: ${process.env.VONAGE_API_KEY}`);
    console.log(`Brand Name: ${process.env.VONAGE_BRAND_NAME}`);
    console.log(`Telefone destino: ${telefone}\n`);
    
    try {
        const resultado = await smsService.enviarCodigoVerificacao(telefone, codigo);
        console.log('\n✅ SUCESSO!');
        console.log('Resultado:', JSON.stringify(resultado, null, 2));
    } catch (error) {
        console.log('\n❌ ERRO!');
        console.error('Erro:', error);
    }
}

// Executar teste
testarSMS();
