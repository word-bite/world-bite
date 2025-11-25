import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./pedidos.css";

const Pedido = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avaliacaoModal, setAvaliacaoModal] = useState(null);
  const [avaliacao, setAvaliacao] = useState(5);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        alert('Faça login para ver seus pedidos');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      console.log('👤 Buscando pedidos do usuário:', user.id);

      const response = await fetch(`${API_BASE_URL}/api/pedidos/cliente/${user.id}`);
      const data = await response.json();

      if (data.sucesso) {
        setPedidos(data.pedidos);
        console.log('✅ Pedidos carregados:', data.pedidos);
      } else {
        console.error('Erro ao carregar pedidos:', data.erro);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pendente: { emoji: '⏳', texto: 'Aguardando confirmação', cor: '#ff9800' },
      aceito: { emoji: '✅', texto: 'Pedido aceito', cor: '#4caf50' },
      preparando: { emoji: '👨‍🍳', texto: 'Preparando', cor: '#2196f3' },
      pronto: { emoji: '🍽️', texto: 'Pronto para retirada', cor: '#9c27b0' },
      em_entrega: { emoji: '🚴', texto: 'Saiu para entrega', cor: '#00bcd4' },
      entregue: { emoji: '✅', texto: 'Entregue', cor: '#4caf50' },
      retirado: { emoji: '✅', texto: 'Retirado', cor: '#4caf50' },
      cancelado: { emoji: '❌', texto: 'Cancelado', cor: '#f44336' },
      recusado: { emoji: '❌', texto: 'Recusado', cor: '#f44336' }
    };
    return statusMap[status] || { emoji: '❓', texto: status, cor: '#757575' };
  };

  const abrirAvaliacaoModal = (pedido) => {
    setAvaliacaoModal(pedido);
    setAvaliacao(pedido.avaliacao || 5);
    setComentario(pedido.comentarioAvaliacao || '');
  };

  const enviarAvaliacao = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pedidos/${avaliacaoModal.id}/avaliar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avaliacao, comentario })
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        alert('✅ Avaliação enviada com sucesso!');
        setAvaliacaoModal(null);
        carregarPedidos(); // Recarregar pedidos
      } else {
        alert('Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao avaliar:', error);
      alert('Erro ao enviar avaliação');
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        {/* Logo */}
        <div className="header-logo">
          <img src="/logoNome.jpeg" alt="World Bite Logo" className="logo-img" />
        </div>

        {/* Barra de busca */}
        <div className="header-search">
          <input
            type="text"
            placeholder="Busque por item ou loja"
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Menu */}
        <nav className="header-menu">
          <a href="/">Início</a>
          <a href="/restaurantes" className="active">Pedidos</a>
        </nav>
      </header>

      {/* Histórico de pedidos */}
      <main className="historico-container">
        <h2>Meus pedidos</h2>

        {loading ? (
          <div className="loading-pedidos">Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="sem-pedidos">
            <p>📦 Você ainda não fez nenhum pedido</p>
            <button onClick={() => navigate('/')} className="btn-voltar-home">
              Fazer meu primeiro pedido
            </button>
          </div>
        ) : (
          <>
            <h3>Histórico ({pedidos.length})</h3>

            {pedidos.map((pedido) => {
              const statusInfo = getStatusInfo(pedido.status);
              return (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-header">
                    <h4>{pedido.restaurante}</h4>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: statusInfo.cor }}
                    >
                      {statusInfo.emoji} {statusInfo.texto}
                    </span>
                  </div>
                  
                  <p className="pedido-numero">Pedido Nº {pedido.id}</p>
                  
                  {pedido.codigoRetirada && (
                    <div className="codigo-retirada-info">
                      🔑 Código de retirada: <strong>{pedido.codigoRetirada}</strong>
                    </div>
                  )}

                  <div className="pedido-info">
                    <ul>
                      {pedido.itens.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.name} - R$ {(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pedido-valores">
                      <p>Subtotal: R$ {(pedido.valorTotal - pedido.taxaEntrega).toFixed(2)}</p>
                      {pedido.taxaEntrega > 0 && (
                        <p>Taxa de entrega: R$ {pedido.taxaEntrega.toFixed(2)}</p>
                      )}
                      <p className="total"><strong>Total: R$ {pedido.valorTotal.toFixed(2)}</strong></p>
                    </div>

                    {pedido.observacoes && (
                      <p className="observacoes">💬 {pedido.observacoes}</p>
                    )}

                    <p className="pedido-data">
                      📅 {new Date(pedido.criadoEm).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="pedido-acoes">
                    {pedido.restauranteTelefone && (
                      <button 
                        className="btn-ajuda"
                        onClick={() => window.open(`tel:${pedido.restauranteTelefone}`)}
                      >
                        📞 Contato
                      </button>
                    )}
                    
                    {(pedido.status === 'entregue' || pedido.status === 'retirado') && (
                      <button 
                        className="btn-avaliar"
                        onClick={() => abrirAvaliacaoModal(pedido)}
                      >
                        {pedido.avaliacao ? '⭐ Ver avaliação' : '⭐ Avaliar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>

      {/* Modal de Avaliação */}
      {avaliacaoModal && (
        <div className="modal-overlay" onClick={() => setAvaliacaoModal(null)}>
          <div className="modal-avaliacao" onClick={(e) => e.stopPropagation()}>
            <h3>Avaliar Pedido #{avaliacaoModal.id}</h3>
            <p>{avaliacaoModal.restaurante}</p>
            
            <div className="estrelas">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`estrela ${star <= avaliacao ? 'ativa' : ''}`}
                  onClick={() => setAvaliacao(star)}
                >
                  ⭐
                </span>
              ))}
            </div>
            
            <textarea
              placeholder="Deixe um comentário (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows="4"
            />
            
            <div className="modal-acoes">
              <button onClick={() => setAvaliacaoModal(null)} className="btn-cancelar">
                Cancelar
              </button>
              <button onClick={enviarAvaliacao} className="btn-enviar">
                Enviar Avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedido;
