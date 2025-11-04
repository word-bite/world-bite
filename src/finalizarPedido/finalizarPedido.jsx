import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // Mock de dados do pedido - em produção viriam do contexto/estado global
  const dadosPedido = {
    clienteId: 1, // Pegar do contexto de usuário logado
    restauranteId: 1, // Pegar do contexto do restaurante selecionado
    itens: [
      { nome: "Hambúrguer Artesanal", preco: 25.90, quantidade: 1 },
      { nome: "Batata Frita", preco: 12.50, quantidade: 1 }
    ],
    valorTotal: 38.40
  };

  const finalizarPedido = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/pedidos/finalizar', {
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
        <h1>Finalize seu pedido</h1>

        <EnderecoEntrega />
        <MetodoPagamento onChange={setMetodoPagamento} />
        <TipoEntrega onChange={setTipoEntrega} />
        <Cupom />

        <div className="cpf-field">
          <label>CPF/CNPJ na nota</label>
          <input type="text" placeholder="Digite seu CPF ou CNPJ" />
        </div>

        <div className="observacoes-field">
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
        <ResumoPedido />
      </div>
    </div>
  );
}
