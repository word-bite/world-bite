import React, { useState, useEffect } from "react";
import "./MetodoPagamento.css";

export default function MetodoPagamento({ onChange, onPaymentDataChange, valorTotal }) {
  const [metodo, setMetodo] = useState("pix");
  const [mostrarFormularioCartao, setMostrarFormularioCartao] = useState(false);
  const [dadosCartao, setDadosCartao] = useState({
    numero: "",
    titular: "",
    validade: "",
    cvv: "",
    cpf: "",
    parcelas: "1"
  });
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  const API_BASE_URL = 'http://localhost:3000';
  const MP_PUBLIC_KEY = 'APP_USR-4e46566c-d6bf-4efb-a1e1-f154da29dc96'; // Chave pública de teste do Mercado Pago

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      console.log('✅ SDK do Mercado Pago carregado');
    };
    script.onerror = () => {
      console.error('❌ Erro ao carregar SDK do Mercado Pago');
    };
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  const selecionar = (tipo) => {
    setMetodo(tipo);
    setMostrarFormularioCartao(tipo === "cartao");
    setErro("");
    if (onChange) onChange(tipo);
  };

  const handleCartaoChange = (e) => {
    const { name, value } = e.target;
    setDadosCartao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processarPagamentoCartao = async () => {
    console.log('🚀 INÍCIO - processarPagamentoCartao');
    
    try {
      setProcessando(true);
      setErro("");

      console.log('📊 STEP 1 - Validando valor total:', valorTotal);
      // Validar valor total
      if (!valorTotal || valorTotal <= 0) {
        throw new Error('Valor total inválido');
      }

      console.log('📊 STEP 2 - Validando dados do cartão:', {
        numero: dadosCartao.numero ? '****' + dadosCartao.numero.slice(-4) : 'vazio',
        titular: dadosCartao.titular || 'vazio',
        validade: dadosCartao.validade || 'vazio',
        cvv: dadosCartao.cvv ? '***' : 'vazio',
        cpf: dadosCartao.cpf ? '***.' + dadosCartao.cpf.slice(-3) : 'vazio'
      });

      // Validar dados do cartão
      if (!dadosCartao.numero || !dadosCartao.titular || !dadosCartao.validade || !dadosCartao.cvv || !dadosCartao.cpf) {
        throw new Error('Preencha todos os dados do cartão');
      }

      console.log('� STEP 3 - Verificando SDK do Mercado Pago');
      // Verificar se o SDK do Mercado Pago está carregado
      if (!window.MercadoPago) {
        throw new Error('SDK do Mercado Pago não carregado. Recarregue a página.');
      }
      console.log('✅ SDK carregado com sucesso');

      console.log('📊 STEP 4 - Inicializando Mercado Pago com chave:', MP_PUBLIC_KEY.substring(0, 20) + '...');
      // Inicializar Mercado Pago
      const mp = new window.MercadoPago(MP_PUBLIC_KEY);
      console.log('✅ Mercado Pago inicializado');

      console.log('📊 STEP 5 - Validando formato da validade');
      // Validar formato da validade
      const validadeParts = dadosCartao.validade.split('/');
      if (validadeParts.length !== 2) {
        throw new Error('Formato de validade inválido. Use MM/AA');
      }
      console.log('✅ Formato da validade OK:', validadeParts);

      console.log('� STEP 6 - Criando token do cartão...');
      console.log('Dados para tokenização:', {
        cardNumber: '****' + dadosCartao.numero.replace(/\s/g, '').slice(-4),
        cardholderName: dadosCartao.titular,
        cardExpirationMonth: validadeParts[0],
        cardExpirationYear: '20' + validadeParts[1],
        securityCode: '***',
        identificationType: 'CPF',
        identificationNumber: '***.' + dadosCartao.cpf.replace(/\D/g, '').slice(-3)
      });

      let cardToken;
      try {
        cardToken = await mp.createCardToken({
          cardNumber: dadosCartao.numero.replace(/\s/g, ''),
          cardholderName: dadosCartao.titular,
          cardExpirationMonth: validadeParts[0],
          cardExpirationYear: '20' + validadeParts[1],
          securityCode: dadosCartao.cvv,
          identificationType: 'CPF',
          identificationNumber: dadosCartao.cpf.replace(/\D/g, '')
        });
        console.log('✅ Token criado com sucesso:', cardToken);
      } catch (tokenError) {
        console.error('❌ ERRO ao criar token:', tokenError);
        throw new Error(`Erro ao tokenizar cartão: ${tokenError.message || JSON.stringify(tokenError)}`);
      }

      console.log('📊 STEP 7 - Preparando dados para enviar ao backend');
      const paymentData = {
        transaction_amount: parseFloat(valorTotal),
        token: cardToken.id,
        description: 'Pedido World Bite',
        installments: parseInt(dadosCartao.parcelas),
        payment_method_id: cardToken.payment_method_id,
        payer: {
          email: 'cliente@worldbite.com',
          identification: {
            type: 'CPF',
            number: dadosCartao.cpf.replace(/\D/g, '')
          }
        }
      };
      console.log('Dados do pagamento:', paymentData);

      // Enviar para o backend processar o pagamento
      console.log('📊 STEP 8 - Enviando requisição para:', `${API_BASE_URL}/api/pagamentos/processar-pagamento`);
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/pagamentos/processar-pagamento`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });
        console.log('✅ Resposta recebida - Status:', response.status, response.statusText);
      } catch (fetchError) {
        console.error('❌ ERRO na requisição HTTP:', fetchError);
        throw new Error(`Erro de conexão com o servidor: ${fetchError.message}`);
      }

      console.log('📊 STEP 9 - Processando resposta JSON');
      let data;
      try {
        data = await response.json();
        console.log('📥 Dados recebidos do backend:', JSON.stringify(data, null, 2));
      } catch (jsonError) {
        console.error('❌ ERRO ao processar JSON:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }

      console.log('📊 STEP 10 - Verificando sucesso do pagamento');
      if (data.sucesso) {
        console.log('✅✅✅ PAGAMENTO APROVADO! ID:', data.payment_id);
        if (onPaymentDataChange) {
          onPaymentDataChange({
            metodo: 'cartao',
            status: data.status,
            payment_id: data.payment_id
          });
        }
        alert('Pagamento aprovado com sucesso!');
      } else {
        console.error('❌ Pagamento não aprovado:', data);
        throw new Error(data.erro || data.detalhes || 'Erro ao processar pagamento');
      }

    } catch (error) {
      console.error('❌❌❌ ERRO GERAL no pagamento:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      setErro(error.message || 'Erro ao processar pagamento. Verifique os dados do cartão.');
    } finally {
      setProcessando(false);
      console.log('🏁 FIM - processarPagamentoCartao');
    }
  };

  const gerarPagamentoPix = async () => {
    try {
      setProcessando(true);
      setErro("");

      // Criar preferência de pagamento PIX
      const response = await fetch(`${API_BASE_URL}/api/pagamentos/criar-preferencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            title: 'Pedido World Bite',
            quantity: 1,
            unit_price: valorTotal
          }],
          payer: {
            email: 'cliente@worldbite.com'
          },
          metadata: {
            tipo: 'pedido',
            metodo_pagamento: 'pix'
          }
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        console.log('✅ Preferência PIX criada');
        
        // Abrir checkout do Mercado Pago
        window.open(data.sandbox_init_point, '_blank');
        
        if (onPaymentDataChange) {
          onPaymentDataChange({
            metodo: 'pix',
            preference_id: data.preference_id,
            external_reference: data.external_reference
          });
        }
      } else {
        throw new Error(data.erro || 'Erro ao gerar pagamento PIX');
      }

    } catch (error) {
      console.error('❌ Erro ao gerar PIX:', error);
      setErro(error.message || 'Erro ao gerar pagamento PIX');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="metodo-pagamento-box">
      <h3>Forma de pagamento</h3>

      {/* Aviso sobre HTTPS */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '15px',
        fontSize: '13px',
        color: '#856404'
      }}>
        <strong>⚠️ Ambiente de Desenvolvimento:</strong><br/>
        Pagamento com cartão requer HTTPS em produção. Use <strong>PIX</strong> para testes ou configure HTTPS local.
      </div>

      <div className="pagamento-opcoes">
        <div
          className={`pagamento-item ${metodo === "pix" ? "ativo" : ""}`}
          onClick={() => selecionar("pix")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="PIX" />
          <span>PIX</span>
        </div>

        <div
          className={`pagamento-item ${metodo === "cartao" ? "ativo" : ""}`}
          onClick={() => selecionar("cartao")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/1003/1003985.png" alt="Cartão" />
          <span>Cartão</span>
        </div>

        <div
          className={`pagamento-item ${metodo === "dinheiro" ? "ativo" : ""}`}
          onClick={() => selecionar("dinheiro")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/2331/2331927.png" alt="Dinheiro" />
          <span>Dinheiro</span>
        </div>
      </div>

      {erro && (
        <div className="erro-pagamento">
          ❌ {erro}
        </div>
      )}

      {metodo === "pix" && (
        <div className="pix-info">
          <p>Pagamento via PIX através do Mercado Pago</p>
          <button 
            onClick={gerarPagamentoPix} 
            disabled={processando}
            className="btn-gerar-pix"
          >
            {processando ? 'Gerando...' : 'Gerar Pagamento PIX'}
          </button>
        </div>
      )}

      {mostrarFormularioCartao && (
        <div className="formulario-cartao">
          <h4>Dados do Cartão</h4>
          
          <div className="form-group">
            <label>Número do Cartão</label>
            <input
              type="text"
              name="numero"
              value={dadosCartao.numero}
              onChange={handleCartaoChange}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
            />
          </div>

          <div className="form-group">
            <label>Nome no Cartão</label>
            <input
              type="text"
              name="titular"
              value={dadosCartao.titular}
              onChange={handleCartaoChange}
              placeholder="NOME SOBRENOME"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Validade</label>
              <input
                type="text"
                name="validade"
                value={dadosCartao.validade}
                onChange={handleCartaoChange}
                placeholder="MM/AA"
                maxLength="5"
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                value={dadosCartao.cvv}
                onChange={handleCartaoChange}
                placeholder="123"
                maxLength="4"
              />
            </div>
          </div>

          <div className="form-group">
            <label>CPF do Titular</label>
            <input
              type="text"
              name="cpf"
              value={dadosCartao.cpf}
              onChange={handleCartaoChange}
              placeholder="000.000.000-00"
              maxLength="14"
            />
          </div>

          <div className="form-group">
            <label>Parcelas</label>
            <select 
              name="parcelas" 
              value={dadosCartao.parcelas}
              onChange={handleCartaoChange}
            >
              <option value="1">1x de R$ {valorTotal?.toFixed(2)}</option>
              <option value="2">2x de R$ {(valorTotal / 2)?.toFixed(2)}</option>
              <option value="3">3x de R$ {(valorTotal / 3)?.toFixed(2)}</option>
              <option value="6">6x de R$ {(valorTotal / 6)?.toFixed(2)}</option>
              <option value="12">12x de R$ {(valorTotal / 12)?.toFixed(2)}</option>
            </select>
          </div>

          <button 
            onClick={processarPagamentoCartao}
            disabled={processando}
            className="btn-processar-cartao"
          >
            {processando ? 'Processando...' : 'Processar Pagamento'}
          </button>
        </div>
      )}

      {metodo === "dinheiro" && (
        <div className="dinheiro-info">
          <p>💵 Pagamento em dinheiro na entrega</p>
          <p className="info-small">O entregador levará troco se necessário</p>
        </div>
      )}
    </div>
  );
}
