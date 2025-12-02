const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    console.log('🔧 Inicializando EmailService');
    
    // Configuração para Gmail
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true para 465, false para outros
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Para desenvolvimento - remover em produção
      },
      // Timeout aumentado
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
    
    console.log('📧 Configuração:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : 'não configurado'
    });
  }

  async sendVerificationEmail(email, code, name = '') {
    console.log('📧 Tentando enviar email de verificação');
    console.log('📧 Para:', email);
    console.log('📧 Código:', code);
    
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Código de Verificação - World Bite',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Código de Verificação</h2>
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>Seu código de verificação é:</p>
            <div style="background-color: #f8f9fa; border: 2px solid #007bff; padding: 20px; text-align: center; font-size: 28px; font-weight: bold; margin: 20px 0; border-radius: 8px; color: #007bff;">
              ${code}
            </div>
            <p>Este código expira em 15 minutos.</p>
            <p>Se você não solicitou este código, ignore este email.</p>
          </div>
        `
      };

      console.log('📧 Enviando email...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado com sucesso:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, name) {
    console.log('📧 Enviando email de boas-vindas para:', email);
    
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Bem-vindo ao World Bite!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Bem-vindo ao World Bite!</h2>
            <p>Olá ${name},</p>
            <p>Sua conta foi verificada com sucesso!</p>
            <p>Obrigado por se juntar a nós!</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de boas-vindas enviado:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    console.log('🔍 Testando conexão com servidor de email...');
    try {
      await this.transporter.verify();
      console.log('✅ Conexão com servidor de email estabelecida');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro na conexão com servidor de email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia nota fiscal por email com anexo PDF
   * @param {string} email - Email do destinatário
   * @param {string} clienteNome - Nome do cliente
   * @param {string} caminhoArquivo - Caminho do arquivo PDF
   * @param {Object} pedidoInfo - Informações do pedido
   */
  async enviarNotaFiscal(email, clienteNome, caminhoArquivo, pedidoInfo) {
    console.log('📧 ========================================');
    console.log('📧 Iniciando envio de nota fiscal');
    console.log('📧 Para:', email);
    console.log('📧 Arquivo:', caminhoArquivo);
    console.log('📧 Cliente:', clienteNome);
    
    try {
      // Verificar se o arquivo existe
      const fs = require('fs');
      if (!fs.existsSync(caminhoArquivo)) {
        throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
      }
      
      console.log('✅ Arquivo encontrado');
      const fileSize = fs.statSync(caminhoArquivo).size;
      console.log(`📊 Tamanho do arquivo: ${(fileSize / 1024).toFixed(2)} KB`);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Sua Nota Fiscal – World Bite',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff6b35; margin: 0;">WORLD BITE</h1>
              <p style="color: #666; margin: 5px 0;">Nota Fiscal do Pedido</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Olá${clienteNome ? ` ${clienteNome}` : ''}! 👋</h2>
              <p style="color: #555; line-height: 1.6;">
                Obrigado por fazer seu pedido no <strong>World Bite</strong>!
              </p>
              <p style="color: #555; line-height: 1.6;">
                A sua nota fiscal está anexada a este e-mail.
              </p>
            </div>

            <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #ff6b35; margin-top: 0;">Resumo do Pedido</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Pedido:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">#${pedidoInfo.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tipo:</td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${pedidoInfo.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Valor Total:</td>
                  <td style="padding: 8px 0; color: #ff6b35; font-weight: bold; font-size: 18px; text-align: right;">
                    ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedidoInfo.valorTotal)}
                  </td>
                </tr>
                ${pedidoInfo.codigoRetirada ? `
                <tr>
                  <td colspan="2" style="padding-top: 15px; text-align: center; background-color: #e6f7e6; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <strong style="color: #27ae60;">Código de Retirada: ${pedidoInfo.codigoRetirada}</strong>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #fff5f0; padding: 15px; border-left: 4px solid #ff6b35; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                💡 <strong>Dica:</strong> Guarde esta nota fiscal para fins de garantia e possíveis trocas.
              </p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Qualquer dúvida, estamos à disposição!
            </p>

            <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                World Bite - Sabores do Mundo na sua Mesa
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                Este é um e-mail automático, por favor não responda.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `NotaFiscal_Pedido_${pedidoInfo.id}.pdf`,
            path: caminhoArquivo,
            contentType: 'application/pdf'
          }
        ]
      };

      console.log('📧 Configurando email...');
      console.log('📧 Assunto:', mailOptions.subject);
      console.log('📧 Anexo:', mailOptions.attachments[0].filename);
      
      console.log('📧 Enviando email com anexo...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ ========================================');
      console.log('✅ Nota fiscal enviada com sucesso!');
      console.log('✅ Message ID:', result.messageId);
      console.log('✅ Response:', result.response);
      console.log('✅ ========================================');
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ ========================================');
      console.error('❌ Erro ao enviar nota fiscal');
      console.error('❌ Erro:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('❌ ========================================');
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();