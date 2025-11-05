import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../config/api";
import RetiradaModal from './RetiradaModal';
import './empresas.css';

export default function PainelChamadas() {
  const [pedidosRetirada, setPedidosRetirada] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  // Função para carregar pedidos prontos para retirada
  const carregarPedidosRetirada = async () => {
    try {
      // Pegar o CNPJ do restaurante logado
      const cnpj = localStorage.getItem('restauranteLogado');
      if (!cnpj) {
        console.error('Restaurante não logado');
        return;
      }
      
      // Simular restauranteId - em produção, buscar pelo CNPJ
      const restauranteId = 1;
      
      const resposta = await fetch(`${API_BASE_URL}/api/pedidos/retirada?restauranteId=${restauranteId}`);
      const dados = await resposta.json();
      setPedidosRetirada(dados);
    } catch (error) {
      console.error('Erro ao carregar pedidos para retirada:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para confirmar retirada
  const confirmarRetirada = async (codigo) => {
    try {
      const resposta = await fetch(`${API_BASE_URL}/api/pedidos/confirmar-retirada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        setMensagem(`✅ Pedido retirado com sucesso! Cliente: ${resultado.cliente}`);
        await carregarPedidosRetirada(); // Atualizar lista
        
        // Reproduzir som de notificação (opcional)
        try {
          new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfBjiH0/PQAAA=').play();
        } catch (e) {
          // Ignorar erro do som
        }
      } else {
        throw new Error(resultado.error || 'Código inválido ou pedido não encontrado');
      }
    } catch (error) {
      console.error('Erro ao confirmar retirada:', error);
      alert(error.message || 'Erro ao confirmar retirada');
      throw error;
    }
  };

  // Atualizar lista automaticamente a cada 5 segundos
  useEffect(() => {
    carregarPedidosRetirada();
    
    const interval = setInterval(() => {
      carregarPedidosRetirada();
      setUltimaAtualizacao(new Date());
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Limpar mensagem após 5 segundos
  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => {
        setMensagem(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  return (
    <div className="tela-empresa-bg">
      <div className="tela-empresa-container">
        <h1 className="tela-empresa-headline">🔔 Painel de Chamadas</h1>
        <p className="tela-empresa-subtitle">Pedidos prontos para retirada</p>

        {mensagem && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ {mensagem}
          </div>
        )}

        <div className="painel-actions">
          <button 
            className="tela-empresa-btn bg-blue-600"
            onClick={() => setModalAberto(true)}
          >
            📱 Confirmar Retirada
          </button>
          <button 
            className="tela-empresa-btn bg-gray-600"
            onClick={() => {
              carregarPedidosRetirada();
              setUltimaAtualizacao(new Date());
            }}
          >
            🔄 Atualizar Lista
          </button>
          <div className="ultima-atualizacao">
            <small>Última atualização: {ultimaAtualizacao.toLocaleTimeString()}</small>
          </div>
        </div>

        {loading ? (
          <p>Carregando pedidos...</p>
        ) : (
          <div className="chamadas-grid">
            {pedidosRetirada.length > 0 ? (
              pedidosRetirada.map((pedido) => (
                <div 
                  key={pedido.id} 
                  className={`chamada-card ${pedido.status === 'retirado' ? 'retirado' : 'aguardando'}`}
                >
                  <div className="chamada-header">
                    <h3>Pedido #{pedido.id}</h3>
                    <span className={`status-badge ${pedido.status}`}>
                      {pedido.status === 'pronto' ? '🟡 Aguardando' : '✅ Retirado'}
                    </span>
                  </div>
                  
                  <div className="chamada-info">
                    <p><strong>Cliente:</strong> {pedido.cliente}</p>
                    <div className="codigo-chamada">
                      <span>Código:</span>
                      <div className="codigo-numero">{pedido.codigoRetirada}</div>
                    </div>
                    <p className="horario">
                      {pedido.status === 'pronto' 
                        ? `Pronto às ${new Date(pedido.atualizadoEm).toLocaleTimeString()}`
                        : `Retirado às ${new Date(pedido.atualizadoEm).toLocaleTimeString()}`
                      }
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>📋 Nenhum pedido aguardando retirada</p>
                <small>Os pedidos aparecerão aqui quando estiverem prontos</small>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmação de retirada */}
        <RetiradaModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onConfirm={confirmarRetirada}
        />
      </div>
    </div>
  );
}
