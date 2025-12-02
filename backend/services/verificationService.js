// src/services/verificationService.js

import vonage from '../config/vonage.js';

// Função para iniciar a verificação e enviar o SMS com o código
async function startVerification(phoneNumber) {
  try {
    const brand = process.env.VONAGE_BRAND_NAME;
    // O número de telefone precisa estar no formato E.164 (ex: 5511999998888)
    const response = await vonage.verify.start({
      number: phoneNumber,
      brand: brand,
      // code_length: '4' // Você pode especificar o tamanho do código se quiser
    });

    console.log('Verification request sent:', response);
    // A API Verify v2 retorna um `request_id` que usamos para verificar o código
    return response.request_id;

  } catch (error) {
    console.error('Error starting Vonage verification:', error);
    throw new Error('Failed to send verification code.');
  }
}

// Função para checar se o código fornecido pelo usuário está correto
async function checkVerification(requestId, code) {
  try {
    const response = await vonage.verify.check(requestId, code);

    console.log('Verification check response:', response);

    // O status será "completed" se o código for válido
    if (response.status === 'completed' || response.status === '0') {
      return { success: true, message: 'Verification successful.' };
    } else {
      // Outros status podem ser 'expired', 'failed', etc.
      return { success: false, message: 'Verification failed: ' + response.status };
    }

  } catch (error) {
    console.error('Error checking Vonage verification:', error);
    // Erros comuns acontecem se o código estiver errado
    if (error.response && error.response.status === 400) {
       return { success: false, message: 'Invalid code provided.' };
    }
    throw new Error('Failed to check verification code.');
  }
}

export const verificationService = {
  startVerification,
  checkVerification,
};