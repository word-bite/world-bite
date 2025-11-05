import React, { useState, useEffect } from 'react';
import './empresas.css'; // Importa o CSS animado

export default function GerenciarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  // Função para buscar pedidos da API
  const carregarPedidos = async () => {
    try {
      // Pegar o CNPJ do restaurante logado
      const cnpj = localStorage.getItem('restauranteLogado');
      if (!cnpj) {
        console.error('Restaurante não logado');
        return;
      }
      
      // Simular restauranteId - em produção, buscar pelo CNPJ
      const restauranteId = 1; // TODO: Buscar ID real do restaurante pelo CNPJ
      
      const resposta = await fetch(`http://localhost:3000/api/pedidos?restauranteId=${restauranteId}`);
      const dados = await resposta.json();
      setPedidos(dados);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // Função para aceitar pedido
  const aceitarPedido = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:3000/api/pedidos/${id}/aceitar`, { method: 'POST' });
      if (resposta.ok) {
        setMensagem('Pedido aceito com sucesso!');
        await carregarPedidos(); // Atualiza lista após ação
      } else {
        setMensagem('Erro ao aceitar pedido.');
      }
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      setMensagem('Erro ao aceitar pedido.');
    }
  };

  // Função para recusar pedido
  const recusarPedido = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:3000/api/pedidos/${id}/recusar`, { method: 'POST' });
      if (resposta.ok) {
        setMensagem('Pedido recusado com sucesso!');
        await carregarPedidos(); // Atualiza lista após ação
      } else {
        setMensagem('Erro ao recusar pedido.');
      }
    } catch (error) {
      console.error('Erro ao recusar pedido:', error);
      setMensagem('Erro ao recusar pedido.');
    }
  };

  // Função para marcar pedido como pronto
  const marcarComoPronto = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:3000/api/pedidos/${id}/pronto`, { method: 'POST' });
      if (resposta.ok) {
        setMensagem('Pedido marcado como pronto!');
        await carregarPedidos(); // Atualiza lista após ação
      } else {
        setMensagem('Erro ao marcar pedido como pronto.');
      }
    } catch (error) {
      console.error('Erro ao marcar pedido como pronto:', error);
      setMensagem('Erro ao atualizar pedido.');
    }
  };

  return (
    <div className="tela-empresa-bg">
      <div className="tela-empresa-container">
        <h1 className="tela-empresa-headline">Pedidos Pendentes</h1>
        <p className="tela-empresa-subtitle">Gerencie os pedidos recebidos pelo restaurante</p>

        {mensagem && (
          <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
            {mensagem}
          </div>
        )}

        <div className="tela-empresa-opcoes">
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white p-4 rounded-xl shadow-md">
                <div className="pedido-header">
                  <h2 className="text-lg font-semibold text-gray-800">Pedido #{pedido.id}</h2>
                  <span className={`status-badge status-${pedido.status}`}>
                    {pedido.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600">Cliente: {pedido.cliente}</p>
                <p className="text-gray-600">
                  Tipo: {pedido.tipoEntrega === 'retirada' ? '🏪 Retirada na loja' : '🛵 Entrega'}
                </p>
                {pedido.codigoRetirada && (
                  <p className="text-blue-600 font-semibold">
                    Código: {pedido.codigoRetirada}
                  </p>
                )}
                <div className="itens-list">
                  <strong>Itens:</strong>
                  <ul>
                    {pedido.itens.map((item, index) => (
                      <li key={index}>{item.nome} (x{item.quantidade})</li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-600"><strong>Total: R$ {pedido.total.toFixed(2)}</strong></p>
                
                {pedido.observacoes && (
                  <p className="text-gray-500"><em>Obs: {pedido.observacoes}</em></p>
                )}
                
                <div className="flex justify-center gap-2 mt-4">
                  {pedido.status === 'pendente' && (
                    <>
                      <button onClick={() => aceitarPedido(pedido.id)} className="tela-empresa-btn bg-green-600">
                        ✅ Aceitar
                      </button>
                      <button onClick={() => recusarPedido(pedido.id)} className="tela-empresa-btn bg-red-600">
                        ❌ Recusar
                      </button>
                    </>
                  )}
                  
                  {pedido.status === 'aceito' && (
                    <button onClick={() => marcarComoPronto(pedido.id)} className="tela-empresa-btn bg-blue-600">
                      🍽️ Marcar como Pronto
                    </button>
                  )}
                  
                  {pedido.status === 'pronto' && pedido.tipoEntrega === 'retirada' && (
                    <div className="pronto-retirada">
                      <p className="text-green-600 font-semibold">✅ Aguardando retirada do cliente</p>
                      <p className="text-sm text-gray-500">Código: <strong>{pedido.codigoRetirada}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Nenhum pedido pendente.</p>
          )}
        </div>
      </div>
    </div>
  );
}