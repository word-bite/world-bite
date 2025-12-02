// backend/services/smsService.js

const { Vonage } = require('@vonage/server-sdk');
const { SMS } = require('@vonage/server-sdk');
require('dotenv').config();

// Configurar Vonage
let vonage = null;

try {
    vonage = new Vonage({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET
    });
    console.log('✅ Vonage SDK inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Vonage SDK:', error.message);
}

/**
 * Enviar SMS usando Vonage
 * @param {string} telefone - Número de telefone no formato internacional (ex: +5511999999999)
 * @param {string} mensagem - Mensagem a ser enviada
 * @returns {Promise<Object>} Resultado do envio
 */
const enviarSMS = async (telefone, mensagem) => {
    return new Promise((resolve, reject) => {
        // Garantir que o telefone está no formato internacional
        let telefoneFormatado = telefone.trim();
        
        // Se o telefone não começar com +, adicionar +55 (Brasil)
        if (!telefoneFormatado.startsWith('+')) {
            // Remover caracteres não numéricos
            telefoneFormatado = telefoneFormatado.replace(/\D/g, '');
            
            // Se tiver 11 dígitos (celular brasileiro), adicionar +55
            if (telefoneFormatado.length === 11) {
                telefoneFormatado = `+55${telefoneFormatado}`;
            } else if (telefoneFormatado.length === 10) {
                // Se tiver 10 dígitos, adicionar 9 depois do DDD
                const ddd = telefoneFormatado.substring(0, 2);
                const numero = telefoneFormatado.substring(2);
                telefoneFormatado = `+55${ddd}9${numero}`;
            } else {
                telefoneFormatado = `+${telefoneFormatado}`;
            }
        }

        const remetente = process.env.VONAGE_BRAND_NAME || 'World Bite';

        console.log('📱 Enviando SMS...');
        console.log(`De: ${remetente}`);
        console.log(`Para: ${telefoneFormatado}`);
        console.log(`Mensagem: ${mensagem}`);

        // Verificar se o Vonage foi inicializado
        if (!vonage) {
            console.warn('⚠️ Vonage não configurado. SMS não será enviado (modo desenvolvimento).');
            return resolve({
                sucesso: true,
                mensagem: 'SMS simulado (Vonage não configurado)',
                modo_dev: true,
                telefone: telefoneFormatado
            });
        }

        // Usar a nova API do Vonage SDK v3
        vonage.sms.send({
            to: telefoneFormatado,
            from: remetente,
            text: mensagem
        })
        .then(response => {
            if (response.messages && response.messages[0]) {
                const message = response.messages[0];
                
                if (message.status === '0') {
                    console.log('✅ SMS enviado com sucesso!');
                    console.log(`ID da mensagem: ${message['message-id']}`);
                    resolve({
                        sucesso: true,
                        mensagem: 'SMS enviado com sucesso',
                        messageId: message['message-id'],
                        telefone: telefoneFormatado
                    });
                } else {
                    console.error(`❌ Falha ao enviar SMS: ${message['error-text']}`);
                    reject({
                        sucesso: false,
                        erro: message['error-text'],
                        status: message.status
                    });
                }
            } else {
                reject({
                    sucesso: false,
                    erro: 'Resposta inválida da API'
                });
            }
        })
        .catch(error => {
            console.error('❌ Erro ao enviar SMS:', error);
            reject({
                sucesso: false,
                erro: error.message || 'Erro ao enviar SMS',
                detalhes: error
            });
        });
    });
};

/**
 * Enviar código de verificação por SMS
 * @param {string} telefone - Número de telefone
 * @param {string} codigo - Código de verificação
 * @returns {Promise<Object>}
 */
const enviarCodigoVerificacao = async (telefone, codigo) => {
    // SEMPRE mostrar o código no console para desenvolvimento
    console.log('\n🔐 ═══════════════════════════════════════');
    console.log('   CÓDIGO DE VERIFICAÇÃO');
    console.log('═══════════════════════════════════════');
    console.log(`📱 Telefone: ${telefone}`);
    console.log(`🔢 Código: ${codigo}`);
    console.log(`⏰ Válido por: 15 minutos`);
    console.log('═══════════════════════════════════════\n');
    
    const mensagem = `Seu código de verificação World Bite é: ${codigo}\n\nVálido por 15 minutos.\n\nNão compartilhe este código.`;
    return await enviarSMS(telefone, mensagem);
};

/**
 * Enviar notificação de pedido confirmado
 * @param {string} telefone - Número de telefone
 * @param {string} codigoRetirada - Código de retirada
 * @param {string} nomeRestaurante - Nome do restaurante
 * @returns {Promise<Object>}
 */
const enviarNotificacaoPedido = async (telefone, codigoRetirada, nomeRestaurante) => {
    const mensagem = `Pedido confirmado! Código de retirada: ${codigoRetirada}\nRestaurante: ${nomeRestaurante}\n\nWorld Bite`;
    return await enviarSMS(telefone, mensagem);
};

/**
 * Enviar notificação de pedido pronto
 * @param {string} telefone - Número de telefone
 * @param {string} codigoRetirada - Código de retirada
 * @returns {Promise<Object>}
 */
const enviarNotificacaoPedidoPronto = async (telefone, codigoRetirada) => {
    const mensagem = `Seu pedido está pronto! Código: ${codigoRetirada}\n\nWorld Bite`;
    return await enviarSMS(telefone, mensagem);
};

module.exports = {
    enviarSMS,
    enviarCodigoVerificacao,
    enviarNotificacaoPedido,
    enviarNotificacaoPedidoPronto
};
