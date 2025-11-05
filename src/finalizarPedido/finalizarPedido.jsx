import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./finalizarPedido.css";

import EnderecoEntrega from "./components/EnderecoEntrega";
import MetodoPagamento from "./components/MetodoPagamento";
import Cupom from "./components/Cupom";
import ResumoPedido from "./components/ResumoPedido";
import TipoEntrega from "./components/TipoEntrega";

export default function FinalizarPedido() {
  const navigate = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState("entrega");
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const [loading, setLoading] = useState(false);
  const [codigoRetirada, setCodigoRetirada] = useState(null);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [enderecoEntrega, setEnderecoEntrega] = useState(null);
  const [freteCalculado, setFreteCalculado] = useState({}); // Armazena frete por endereço ID
  const [itensCarrinho, setItensCarrinho] = useState([]);

  // Carregar itens do carrinho do localStorage
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      try {
        const itens = JSON.parse(carrinhoSalvo);
        setItensCarrinho(itens);
        console.log('🛒 Carrinho carregado:', itens);
      } catch (error) {
        console.error('❌ Erro ao carregar carrinho:', error);
        setItensCarrinho([]);
      }
    } else {
      console.warn('⚠️ Nenhum item no carrinho');
      setItensCarrinho([]);
    }
  }, []);

  // Calcular valor total do carrinho
  const valorTotal = itensCarrinho.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Mock de dados do pedido - agora usando dados reais do carrinho
  const dadosPedido = {
    clienteId: 1, // Pegar do contexto de usuário logado
    restauranteId: 1, // Pegar do contexto do restaurante selecionado
    enderecoRestaurante: { // Endereço do restaurante para calcular frete
      latitude: -23.561684,
      longitude: -46.656139
    },
    itens: itensCarrinho,
    valorTotal: valorTotal
  };

  // Calcular frete baseado na distância (apenas uma vez por endereço)
  const calcularFrete = (enderecoCliente) => {
    if (tipoEntrega === "retirada") {
      setTaxaEntrega(0);
      return;
    }

    // Criar uma chave única para o endereço
    const enderecoKey = enderecoCliente?.id || JSON.stringify(enderecoCliente);
    
    // Se já foi calculado para este endereço, reutilizar o valor
    if (freteCalculado[enderecoKey] !== undefined) {
      console.log(`ℹ️ Frete já calculado para este endereço: R$ ${freteCalculado[enderecoKey].toFixed(2)}`);
      setTaxaEntrega(freteCalculado[enderecoKey]);
      return;
    }

    // Simulação simples: R$ 3,00 por km + taxa fixa de R$ 5,00
    // Em produção, usar Google Maps Distance Matrix API
    const distanciaKm = Math.random() * 10 + 2; // Mock: entre 2 e 12 km
    const frete = Math.ceil((distanciaKm * 3) + 5);
    
    // Armazenar o frete calculado para este endereço
    setFreteCalculado(prev => ({
      ...prev,
      [enderecoKey]: frete
    }));
    setTaxaEntrega(frete);
    
    console.log(`📍 Distância estimada: ${distanciaKm.toFixed(2)} km`);
    console.log(`💰 Frete calculado: R$ ${frete.toFixed(2)}`);
  };

  const handleEnderecoChange = (endereco) => {
    setEnderecoEntrega(endereco);
    if (tipoEntrega === "entrega") {
      calcularFrete(endereco);
    }
  };

  const handleTipoEntregaChange = (tipo) => {
    setTipoEntrega(tipo);
    if (tipo === "retirada") {
      setTaxaEntrega(0);
    } else if (enderecoEntrega) {
      calcularFrete(enderecoEntrega);
    }
  };

  const finalizarPedido = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedidos/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId: dadosPedido.clienteId,
          restauranteId: dadosPedido.restauranteId,
          tipoEntrega: tipoEntrega,
          itens: dadosPedido.itens,
          valorTotal: dadosPedido.valorTotal,
          observacoes: document.querySelector('textarea')?.value || null
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao finalizar pedido');
      }

      const resultado = await response.json();
      
      if (resultado.sucesso) {
        if (tipoEntrega === 'retirada' && resultado.pedido.codigoRetirada) {
          setCodigoRetirada(resultado.pedido.codigoRetirada);
          alert(`Pedido confirmado! 🎉\n\nCódigo de retirada: ${resultado.pedido.codigoRetirada}\n\nGuarde este código para retirar seu pedido na loja.`);
        } else {
          alert('Pedido confirmado! Em breve você receberá a entrega.');
        }
        
        // Redirecionar para página de acompanhamento
        navigate('/pedidos');
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sacola-container">
      {/* COLUNA ESQUERDA */}
      <div className="col-esquerda">
        <div className="header-finalizar">
          <button onClick={() => navigate(-1)} className="btn-voltar">
            ← Voltar
          </button>
          <h1>Finalize seu pedido</h1>
        </div>

        {/* Tipo de Entrega - Movido para cima */}
        <TipoEntrega onChange={handleTipoEntregaChange} />

        {/* Endereço - Só aparece se for entrega */}
        {tipoEntrega === "entrega" && (
          <EnderecoEntrega 
            onEnderecoChange={handleEnderecoChange}
            onEnderecoSelecionado={handleEnderecoChange}
          />
        )}

        {/* Método de Pagamento */}
        <MetodoPagamento 
          onChange={setMetodoPagamento} 
          valorTotal={dadosPedido.valorTotal + taxaEntrega}
        />

        {/* Cupom */}
        <Cupom />

        <div className="observacoes-field">
          <label>CPF/CNPJ na nota</label>
          <input 
            type="text" 
            placeholder="Digite seu CPF ou CNPJ"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '15px'
            }}
          />
          
          <label>Observações (opcional)</label>
          <textarea 
            placeholder="Ex: Sem cebola, ponto da carne, etc."
            rows="3"
          ></textarea>
        </div>

        {codigoRetirada && (
          <div className="codigo-retirada-display">
            <h3>🎉 Pedido Confirmado!</h3>
            <p>Seu código de retirada é:</p>
            <div className="codigo-destaque">{codigoRetirada}</div>
            <p><small>Guarde este código para retirar na loja</small></p>
          </div>
        )}

        <button 
          className={`botao-finalizar ${loading ? 'loading' : ''}`}
          onClick={finalizarPedido}
          disabled={loading}
        >
          {loading ? 'Processando...' : 
           tipoEntrega === 'retirada' ? 'Confirmar pedido para retirada' : 'Fazer pedido'}
        </button>
      </div>

      {/* COLUNA DIREITA */}
      <div className="col-direita">
        <ResumoPedido 
          itens={dadosPedido.itens}
          valorTotal={dadosPedido.valorTotal}
          taxaEntrega={taxaEntrega}
          tipoEntrega={tipoEntrega}
        />
      </div>
    </div>
  );
}
