const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email, code, name = '') {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Código de Verificação - World Bite',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Código de Verificação</h2>
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>Seu código de verificação é:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
              ${code}
            </div>
            <p>Este código expira em 15 minutos.</p>
            <p>Se você não solicitou este código, ignore este email.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, name) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Bem-vindo ao World Bite!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo ao World Bite!</h2>
            <p>Olá ${name},</p>
            <p>Sua conta foi verificada com sucesso!</p>
            <p>Agora você pode aproveitar todos os recursos da nossa plataforma.</p>
            <p>Obrigado por se juntar a nós!</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
