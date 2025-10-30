const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    console.log('🔧 Inicializando EmailService');
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
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
}

module.exports = new EmailService();
