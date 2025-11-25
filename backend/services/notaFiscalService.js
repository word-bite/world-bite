// services/notaFiscalService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class NotaFiscalService {
  constructor() {
    // Diretório temporário para PDFs
    this.tempDir = path.join(__dirname, '..', 'temp');
    
    // Criar diretório temp se não existir
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Gera número da nota fiscal (mock - em produção usar sequência do BD)
   */
  gerarNumeroNF() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `NF-${timestamp}-${random}`;
  }

  /**
   * Formata valor para moeda brasileira
   */
  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Formata data
   */
  formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  }

  /**
   * Gera PDF da nota fiscal
   * @param {Object} dados - Dados do pedido e cliente
   * @returns {Promise<string>} - Caminho do arquivo gerado
   */
  async gerarNotaFiscal(dados) {
    return new Promise((resolve, reject) => {
      try {
        const {
          pedido,
          cliente,
          restaurante,
          itens,
          endereco
        } = dados;

        const numeroNF = this.gerarNumeroNF();
        const dataEmissao = new Date();
        const nomeArquivo = `NF_${numeroNF}.pdf`;
        const caminhoArquivo = path.join(this.tempDir, nomeArquivo);

        // Criar documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Stream para arquivo
        const stream = fs.createWriteStream(caminhoArquivo);
        doc.pipe(stream);

        // ============================================
        // CABEÇALHO
        // ============================================
        doc.fontSize(24)
           .fillColor('#ff6b35')
           .text('WORLD BITE', { align: 'center' });

        doc.fontSize(10)
           .fillColor('#666')
           .text('Nota Fiscal de Serviço', { align: 'center' });

        doc.moveDown();
        
        // Linha divisória
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .strokeColor('#ddd')
           .stroke();

        doc.moveDown();

        // ============================================
        // DADOS DA NOTA FISCAL
        // ============================================
        doc.fontSize(10)
           .fillColor('#333');

        const yInicio = doc.y;
        
        // Coluna esquerda
        doc.text(`Nota Fiscal: ${numeroNF}`, 50, yInicio);
        doc.text(`Data de Emissão: ${this.formatarData(dataEmissao)}`, 50, yInicio + 15);
        doc.text(`Pedido: #${pedido.id}`, 50, yInicio + 30);

        // Coluna direita
        doc.text(`Tipo: ${pedido.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}`, 350, yInicio, { width: 200 });
        doc.text(`Status: ${pedido.status}`, 350, yInicio + 15, { width: 200 });

        doc.y = yInicio + 60;
        doc.moveDown();

        // ============================================
        // DADOS DO RESTAURANTE
        // ============================================
        doc.fontSize(12)
           .fillColor('#ff6b35')
           .text('DADOS DO EMITENTE', 50, doc.y);

        doc.fontSize(10)
           .fillColor('#333')
           .moveDown(0.5);

        doc.text(`Restaurante: ${restaurante.nome || 'Restaurante Teste'}`, 50, doc.y);
        doc.text(`CNPJ: ${this.formatarCNPJ(restaurante.cnpj) || 'Não informado'}`, 50, doc.y + 15);
        doc.text(`Endereço: ${restaurante.endereco || 'Não informado'}`, 50, doc.y + 30);
        doc.text(`Telefone: ${restaurante.telefone_contato || 'Não informado'}`, 50, doc.y + 45);

        doc.y += 70;
        doc.moveDown();

        // ============================================
        // DADOS DO CLIENTE
        // ============================================
        doc.fontSize(12)
           .fillColor('#ff6b35')
           .text('DADOS DO CLIENTE', 50, doc.y);

        doc.fontSize(10)
           .fillColor('#333')
           .moveDown(0.5);

        doc.text(`Nome: ${cliente.nome}`, 50, doc.y);
        doc.text(`Email: ${cliente.email || 'Não informado'}`, 50, doc.y + 15);
        doc.text(`CPF: ${this.formatarCPF(cliente.cpf) || 'Não informado'}`, 50, doc.y + 30);
        doc.text(`Telefone: ${this.formatarTelefone(cliente.telefone) || 'Não informado'}`, 50, doc.y + 45);

        if (endereco && pedido.tipoEntrega === 'entrega') {
          doc.text(`Endereço: ${endereco.rua}, ${endereco.numero}`, 50, doc.y + 60);
          if (endereco.complemento) {
            doc.text(`Complemento: ${endereco.complemento}`, 50, doc.y + 75);
          }
          doc.text(`${endereco.bairro} - ${endereco.cidade}/${endereco.estado}`, 50, doc.y + 90);
          doc.text(`CEP: ${this.formatarCEP(endereco.cep)}`, 50, doc.y + 105);
        }

        doc.y += endereco && pedido.tipoEntrega === 'entrega' ? 130 : 70;
        doc.moveDown();

        // ============================================
        // ITENS DO PEDIDO
        // ============================================
        doc.fontSize(12)
           .fillColor('#ff6b35')
           .text('ITENS DO PEDIDO', 50, doc.y);

        doc.moveDown(0.5);

        // Cabeçalho da tabela
        const tabelaTop = doc.y;
        doc.fontSize(9)
           .fillColor('#fff')
           .rect(50, tabelaTop, 495, 25)
           .fill('#ff6b35');

        doc.fillColor('#fff')
           .text('ITEM', 60, tabelaTop + 8, { width: 200 })
           .text('QTD', 270, tabelaTop + 8, { width: 50 })
           .text('PREÇO UN.', 330, tabelaTop + 8, { width: 80 })
           .text('SUBTOTAL', 420, tabelaTop + 8, { width: 100 });

        // Itens
        let yItem = tabelaTop + 35;
        const itensPedido = typeof itens === 'string' ? JSON.parse(itens) : itens;

        doc.fillColor('#333');
        itensPedido.forEach((item, index) => {
          const bgColor = index % 2 === 0 ? '#f9f9f9' : '#fff';
          
          doc.rect(50, yItem - 5, 495, 25)
             .fill(bgColor);

          doc.fillColor('#333')
             .text(item.name || item.nome, 60, yItem, { width: 200 })
             .text(item.quantity || item.quantidade, 270, yItem, { width: 50 })
             .text(this.formatarMoeda(item.price || item.preco), 330, yItem, { width: 80 })
             .text(this.formatarMoeda((item.price || item.preco) * (item.quantity || item.quantidade)), 420, yItem, { width: 100 });

          yItem += 25;
        });

        doc.y = yItem + 10;

        // ============================================
        // TOTALIZADORES
        // ============================================
        doc.moveDown();
        
        const totalTop = doc.y;
        const subtotal = parseFloat(pedido.valorTotal) - parseFloat(pedido.taxaEntrega || 0);

        doc.fontSize(10)
           .fillColor('#666')
           .text('Subtotal:', 350, totalTop, { width: 100, align: 'right' })
           .text(this.formatarMoeda(subtotal), 460, totalTop, { width: 85, align: 'right' });

        if (pedido.taxaEntrega && parseFloat(pedido.taxaEntrega) > 0) {
          doc.text('Taxa de Entrega:', 350, totalTop + 20, { width: 100, align: 'right' })
             .text(this.formatarMoeda(pedido.taxaEntrega), 460, totalTop + 20, { width: 85, align: 'right' });
        }

        // Linha antes do total
        doc.moveTo(350, totalTop + 40)
           .lineTo(545, totalTop + 40)
           .strokeColor('#ddd')
           .stroke();

        doc.fontSize(12)
           .fillColor('#ff6b35')
           .text('TOTAL:', 350, totalTop + 50, { width: 100, align: 'right' })
           .text(this.formatarMoeda(pedido.valorTotal), 460, totalTop + 50, { width: 85, align: 'right' });

        // ============================================
        // OBSERVAÇÕES
        // ============================================
        if (pedido.observacoes) {
          doc.y = totalTop + 90;
          doc.fontSize(10)
             .fillColor('#666')
             .text('Observações:', 50, doc.y);
          
          doc.fontSize(9)
             .fillColor('#333')
             .text(pedido.observacoes, 50, doc.y + 15, { width: 495 });
        }

        // ============================================
        // CÓDIGO DE RETIRADA (SE APLICÁVEL)
        // ============================================
        if (pedido.codigoRetirada && pedido.tipoEntrega === 'retirada') {
          doc.y += 40;
          doc.fontSize(12)
             .fillColor('#ff6b35')
             .text('CÓDIGO DE RETIRADA', 50, doc.y);

          doc.fontSize(20)
             .fillColor('#333')
             .text(pedido.codigoRetirada, 50, doc.y + 20, {
               width: 495,
               align: 'center'
             });

          doc.fontSize(9)
             .fillColor('#666')
             .text('Apresente este código na retirada do pedido', 50, doc.y + 50, {
               width: 495,
               align: 'center'
             });
        }

        // ============================================
        // RODAPÉ
        // ============================================
        doc.fontSize(8)
           .fillColor('#999')
           .text(
             'Este documento foi gerado automaticamente pelo sistema World Bite.\nPara dúvidas, entre em contato conosco.',
             50,
             750,
             { align: 'center', width: 495 }
           );

        // Finalizar PDF
        doc.end();

        // Aguardar conclusão
        stream.on('finish', () => {
          console.log(`✅ Nota fiscal gerada: ${nomeArquivo}`);
          resolve(caminhoArquivo);
        });

        stream.on('error', (error) => {
          console.error('❌ Erro ao gerar PDF:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Erro na geração da nota fiscal:', error);
        reject(error);
      }
    });
  }

  /**
   * Deleta arquivo temporário
   */
  deletarArquivo(caminhoArquivo) {
    try {
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
        console.log(`🗑️ Arquivo deletado: ${path.basename(caminhoArquivo)}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
    }
  }

  /**
   * Formata CPF
   */
  formatarCPF(cpf) {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ
   */
  formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    const numeros = cnpj.replace(/\D/g, '');
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata telefone
   */
  formatarTelefone(telefone) {
    if (!telefone) return '';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  /**
   * Formata CEP
   */
  formatarCEP(cep) {
    if (!cep) return '';
    const numeros = cep.replace(/\D/g, '');
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

module.exports = new NotaFiscalService();
