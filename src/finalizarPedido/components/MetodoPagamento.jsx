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
  const MP_PUBLIC_KEY = 'TEST-YOUR-PUBLIC-KEY-HERE'; // Substitua pela sua chave pública de teste

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
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
    try {
      setProcessando(true);
      setErro("");

      // Validar dados do cartão
      if (!dadosCartao.numero || !dadosCartao.titular || !dadosCartao.validade || !dadosCartao.cvv) {
        throw new Error('Preencha todos os dados do cartão');
      }

      // Inicializar Mercado Pago
      const mp = new window.MercadoPago(MP_PUBLIC_KEY);

      // Criar token do cartão
      const cardToken = await mp.createCardToken({
        cardNumber: dadosCartao.numero.replace(/\s/g, ''),
        cardholderName: dadosCartao.titular,
        cardExpirationMonth: dadosCartao.validade.split('/')[0],
        cardExpirationYear: '20' + dadosCartao.validade.split('/')[1],
        securityCode: dadosCartao.cvv,
        identificationType: 'CPF',
        identificationNumber: dadosCartao.cpf.replace(/\D/g, '')
      });

      // Enviar para o backend processar o pagamento
      const response = await fetch(`${API_BASE_URL}/api/pagamentos/processar-pagamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_amount: valorTotal,
          token: cardToken.id,
          description: 'Pedido World Bite',
          installments: parseInt(dadosCartao.parcelas),
          payment_method_id: cardToken.payment_method_id,
          payer: {
            email: 'cliente@worldbite.com', // Você pode pegar do usuário logado
            identification: {
              type: 'CPF',
              number: dadosCartao.cpf.replace(/\D/g, '')
            }
          }
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        console.log('✅ Pagamento aprovado:', data.payment_id);
        if (onPaymentDataChange) {
          onPaymentDataChange({
            metodo: 'cartao',
            status: data.status,
            payment_id: data.payment_id
          });
        }
        alert('Pagamento aprovado com sucesso!');
      } else {
        throw new Error(data.erro || 'Erro ao processar pagamento');
      }

    } catch (error) {
      console.error('❌ Erro no pagamento:', error);
      setErro(error.message || 'Erro ao processar pagamento');
    } finally {
      setProcessando(false);
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
