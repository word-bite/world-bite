import React, { useState, useEffect } from 'react';
import './empresas.css'; // Importa o CSS animado

export default function GerenciarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  // Função para buscar pedidos da API
  const carregarPedidos = async () => {
    try {
      const resposta = await fetch('/api/pedidos');
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
      const resposta = await fetch(`/api/pedidos/${id}/aceitar`, { method: 'POST' });
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
      const resposta = await fetch(`/api/pedidos/${id}/recusar`, { method: 'POST' });
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
                <h2 className="text-lg font-semibold text-gray-800">Pedido #{pedido.id}</h2>
                <p className="text-gray-600">Cliente: {pedido.cliente}</p>
                <p className="text-gray-600">Itens: {pedido.itens.join(', ')}</p>
                <p className="text-gray-600">Total: R$ {pedido.total.toFixed(2)}</p>
                <div className="flex justify-center gap-4 mt-4">
                  <button onClick={() => aceitarPedido(pedido.id)} className="tela-empresa-btn bg-green-600">
                    Aceitar
                  </button>
                  <button onClick={() => recusarPedido(pedido.id)} className="tela-empresa-btn bg-red-600">
                    Recusar
                  </button>
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