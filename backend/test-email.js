// test-email.js
require('dotenv').config();
const emailService = require('./services/emailService');
const notaFiscalService = require('./services/notaFiscalService');
const path = require('path');

async function testarEmail() {
  console.log('🧪 ========================================');
  console.log('🧪 TESTE DE ENVIO DE NOTA FISCAL');
  console.log('🧪 ========================================\n');

  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com servidor de email...');
    const conexao = await emailService.testConnection();
    
    if (!conexao.success) {
      console.error('❌ Falha na conexão:', conexao.error);
      console.log('\n💡 Dicas:');
      console.log('   - Verifique se o EMAIL_HOST está correto no .env');
      console.log('   - Para Gmail, use senha de app (não a senha normal)');
      console.log('   - Acesse: https://myaccount.google.com/apppasswords');
      return;
    }
    
    console.log('✅ Conexão OK\n');

    // 2. Gerar PDF de teste
    console.log('2️⃣ Gerando PDF de teste...');
    const dadosTeste = {
      pedido: {
        id: 999,
        tipoEntrega: 'entrega',
        status: 'pendente',
        valorTotal: 100.50,
        taxaEntrega: 10.00,
        codigoRetirada: '1234',
        observacoes: 'Teste de nota fiscal'
      },
      cliente: {
        nome: 'Cliente Teste',
        email: 'teste@email.com',
        cpf: '12345678900',
        telefone: '11999999999'
      },
      restaurante: {
        nome: 'Restaurante Teste',
        cnpj: '12345678000199',
        endereco: 'Rua Teste, 123 - São Paulo, SP',
        telefone_contato: '11988887777'
      },
      itens: JSON.stringify([
        { name: 'Hambúrguer', quantity: 2, price: 25.00 },
        { name: 'Batata Frita', quantity: 1, price: 15.00 },
        { name: 'Refrigerante', quantity: 2, price: 8.00 }
      ]),
      endereco: {
        cep: '01234567',
        rua: 'Rua Exemplo',
        numero: '456',
        complemento: 'Apto 78',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      }
    };

    const caminhoNF = await notaFiscalService.gerarNotaFiscal(dadosTeste);
    console.log('✅ PDF gerado:', caminhoNF);
    console.log(`✅ Arquivo existe: ${require('fs').existsSync(caminhoNF)}\n`);

    // 3. Enviar email
    console.log('3️⃣ Enviando email...');
    console.log(`   Para: ${process.env.EMAIL_USER || 'NÃO CONFIGURADO'}`);
    
    const resultado = await emailService.enviarNotaFiscal(
      process.env.EMAIL_USER, // Enviar para o próprio email configurado
      'Cliente Teste',
      caminhoNF,
      {
        id: 999,
        tipoEntrega: 'entrega',
        valorTotal: 100.50,
        codigoRetirada: '1234'
      }
    );

    if (resultado.success) {
      console.log('\n✅ ========================================');
      console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log('✅ ========================================');
      console.log(`✅ Email enviado para: ${process.env.EMAIL_USER}`);
      console.log('✅ Verifique sua caixa de entrada (e spam)');
    } else {
      console.log('\n❌ ========================================');
      console.log('❌ FALHA NO TESTE');
      console.log('❌ ========================================');
      console.log('❌ Erro:', resultado.error);
    }

    // 4. Limpar arquivo
    setTimeout(() => {
      notaFiscalService.deletarArquivo(caminhoNF);
      process.exit(resultado.success ? 0 : 1);
    }, 2000);

  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }
}

testarEmail();
