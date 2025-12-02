import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './RelatoriosPlataforma.css';

export default function RelatoriosPlataforma() {
  const [dados, setDados] = useState(null);
  const [todosPedidos, setTodosPedidos] = useState([]);
  const [todosPratos, setTodosPratos] = useState([]);
  const [todosRestaurantes, setTodosRestaurantes] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState('resumo');
  
  // Estados de filtros
  const [filtroPedidoStatus, setFiltroPedidoStatus] = useState('');
  const [filtroPratoDisponivel, setFiltroPratoDisponivel] = useState('');
  const [filtroPratoCategoria, setFiltroPratoCategoria] = useState('');
  const [filtroRestauranteAtivo, setFiltroRestauranteAtivo] = useState('');
  const [filtroUsuarioAtivo, setFiltroUsuarioAtivo] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar resumo
      const resResumo = await fetch(`${API_BASE_URL}/api/relatorios/plataforma`);
      if (!resResumo.ok) throw new Error('Erro ao carregar resumo');
      const dataResumo = await resResumo.json();
      setDados(dataResumo);

      // Carregar todos os pedidos
      const urlPedidos = `${API_BASE_URL}/api/relatorios/pedidos?limit=1000${filtroPedidoStatus ? `&status=${filtroPedidoStatus}` : ''}`;
      const resPedidos = await fetch(urlPedidos);
      if (resPedidos.ok) {
        const dataPedidos = await resPedidos.json();
        setTodosPedidos(dataPedidos.pedidos || []);
      }

      // Carregar todos os pratos
      const urlPratos = `${API_BASE_URL}/api/relatorios/pratos?limit=1000${filtroPratoDisponivel ? `&disponivel=${filtroPratoDisponivel}` : ''}${filtroPratoCategoria ? `&categoria=${filtroPratoCategoria}` : ''}`;
      const resPratos = await fetch(urlPratos);
      if (resPratos.ok) {
        const dataPratos = await resPratos.json();
        setTodosPratos(dataPratos.pratos || []);
      }

      // Carregar todos os restaurantes
      const urlRestaurantes = `${API_BASE_URL}/api/relatorios/restaurantes?limit=1000${filtroRestauranteAtivo ? `&ativo=${filtroRestauranteAtivo}` : ''}`;
      const resRestaurantes = await fetch(urlRestaurantes);
      if (resRestaurantes.ok) {
        const dataRestaurantes = await resRestaurantes.json();
        setTodosRestaurantes(dataRestaurantes.restaurantes || []);
      }

      // Carregar todos os usuários
      const urlUsuarios = `${API_BASE_URL}/api/relatorios/usuarios?limit=1000${filtroUsuarioAtivo ? `&ativo=${filtroUsuarioAtivo}` : ''}`;
      const resUsuarios = await fetch(urlUsuarios);
      if (resUsuarios.ok) {
        const dataUsuarios = await resUsuarios.json();
        setTodosUsuarios(dataUsuarios.usuarios || []);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pendente': '⏳ Pendente',
      'confirmado': '✅ Confirmado',
      'preparando': '👨‍🍳 Preparando',
      'pronto': '🍽️ Pronto',
      'a_caminho': '🚚 A Caminho',
      'entregue': '✅ Entregue',
      'retirado': '✅ Retirado',
      'cancelado': '❌ Cancelado'
    };
    return badges[status] || status;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relatorios-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={carregarDados} className="btn-recarregar">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dados) return null;

  return (
    <div className="relatorios-container">
      <div className="relatorios-header">
        <h1>📊 Relatórios da Plataforma</h1>
        <button onClick={carregarDados} className="btn-atualizar">
          🔄 Atualizar
        </button>
      </div>

      {/* Abas de Navegação */}
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${abaSelecionada === 'resumo' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('resumo')}
        >
          📊 Resumo
        </button>
        <button 
          className={`tab-btn ${abaSelecionada === 'pedidos' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('pedidos')}
        >
          🛒 Pedidos ({todosPedidos.length})
        </button>
        <button 
          className={`tab-btn ${abaSelecionada === 'pratos' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('pratos')}
        >
          🍽️ Pratos ({todosPratos.length})
        </button>
        <button 
          className={`tab-btn ${abaSelecionada === 'restaurantes' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('restaurantes')}
        >
          🏪 Restaurantes ({todosRestaurantes.length})
        </button>
        <button 
          className={`tab-btn ${abaSelecionada === 'usuarios' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('usuarios')}
        >
          👥 Usuários ({todosUsuarios.length})
        </button>
      </div>

      {/* Aba: Resumo */}
      {abaSelecionada === 'resumo' && dados.resumo && (
        <>
          <div className="cards-grid">
            <div className="card-stat">
              <div className="card-icon">🛒</div>
              <div className="card-content">
                <h3>Total de Pedidos</h3>
                <p className="card-value">{dados.resumo.totalPedidos}</p>
                <small>Concluídos: {dados.resumo.pedidosConcluidos}</small>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Vendas Totais</h3>
                <p className="card-value">{formatarMoeda(dados.resumo.valorTotalVendas)}</p>
                <small>Receita total</small>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h3>Ticket Médio</h3>
                <p className="card-value">{formatarMoeda(dados.resumo.ticketMedio)}</p>
                <small>Por pedido</small>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon">🏪</div>
              <div className="card-content">
                <h3>Restaurantes</h3>
                <p className="card-value">{dados.resumo.totalRestaurantes}</p>
                <small>Ativos: {dados.resumo.restaurantesAtivos}</small>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon">🍽️</div>
              <div className="card-content">
                <h3>Pratos</h3>
                <p className="card-value">{dados.resumo.totalPratos}</p>
                <small>Disponíveis: {dados.resumo.pratosDisponiveis}</small>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Usuários</h3>
                <p className="card-value">{dados.resumo.totalUsuarios}</p>
                <small>Ativos: {dados.resumo.usuariosAtivos}</small>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Aba: Todos os Pedidos */}
      {abaSelecionada === 'pedidos' && (
        <div className="lista-completa">
          <div className="header-com-filtros">
            <h2>🛒 Todos os Pedidos ({todosPedidos.length})</h2>
            <div className="filtros">
              <label>
                Status:
                <select 
                  value={filtroPedidoStatus} 
                  onChange={(e) => { setFiltroPedidoStatus(e.target.value); }}
                  className="filtro-select"
                >
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="preparando">Preparando</option>
                  <option value="pronto">Pronto</option>
                  <option value="a_caminho">A Caminho</option>
                  <option value="entregue">Entregue</option>
                  <option value="retirado">Retirado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
              <button onClick={carregarDados} className="btn-filtrar">
                🔍 Filtrar
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Restaurante</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Tipo</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {todosPedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{pedido.restaurante.nome}</td>
                    <td>
                      <div><strong>{pedido.cliente.nome}</strong></div>
                      <small>{pedido.cliente.email}</small>
                    </td>
                    <td className="valor">{formatarMoeda(pedido.valorTotal)}</td>
                    <td>
                      <span className={`badge status-${pedido.status}`}>
                        {getStatusBadge(pedido.status)}
                      </span>
                    </td>
                    <td>{pedido.tipoEntrega === 'entrega' ? '🚚 Entrega' : '🏪 Retirada'}</td>
                    <td>{formatarData(pedido.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba: Todos os Pratos */}
      {abaSelecionada === 'pratos' && (
        <div className="lista-completa">
          <div className="header-com-filtros">
            <h2>🍽️ Todos os Pratos ({todosPratos.length})</h2>
            <div className="filtros">
              <label>
                Categoria:
                <select 
                  value={filtroPratoCategoria} 
                  onChange={(e) => { setFiltroPratoCategoria(e.target.value); }}
                  className="filtro-select"
                >
                  <option value="">Todas</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="PRINCIPAL">Principal</option>
                  <option value="ACOMPANHAMENTO">Acompanhamento</option>
                  <option value="SOBREMESA">Sobremesa</option>
                  <option value="BEBIDA">Bebida</option>
                </select>
              </label>
              <label>
                Status:
                <select 
                  value={filtroPratoDisponivel} 
                  onChange={(e) => { setFiltroPratoDisponivel(e.target.value); }}
                  className="filtro-select"
                >
                  <option value="">Todos</option>
                  <option value="true">Disponível</option>
                  <option value="false">Indisponível</option>
                </select>
              </label>
              <button onClick={carregarDados} className="btn-filtrar">
                🔍 Filtrar
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Restaurante</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todosPratos.map(prato => (
                  <tr key={prato.id}>
                    <td>#{prato.id}</td>
                    <td>
                      <div><strong>{prato.nome}</strong></div>
                      <small>{prato.descricao}</small>
                    </td>
                    <td>{prato.restaurante.nome}</td>
                    <td>{prato.categoria}</td>
                    <td className="valor">{formatarMoeda(prato.preco)}</td>
                    <td>
                      <span className={`badge ${prato.disponivel ? 'badge-success' : 'badge-danger'}`}>
                        {prato.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba: Todos os Restaurantes */}
      {abaSelecionada === 'restaurantes' && (
        <div className="lista-completa">
          <div className="header-com-filtros">
            <h2>🏪 Todos os Restaurantes ({todosRestaurantes.length})</h2>
            <div className="filtros">
              <label>
                Status:
                <select 
                  value={filtroRestauranteAtivo} 
                  onChange={(e) => { setFiltroRestauranteAtivo(e.target.value); }}
                  className="filtro-select"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
              </label>
              <button onClick={carregarDados} className="btn-filtrar">
                🔍 Filtrar
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>Pratos</th>
                  <th>Pedidos</th>
                  <th>Nota</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todosRestaurantes.map(restaurante => (
                  <tr key={restaurante.id}>
                    <td>#{restaurante.id}</td>
                    <td>
                      <div><strong>{restaurante.nome}</strong></div>
                      <small>{restaurante.endereco}</small>
                    </td>
                    <td>{restaurante.cnpj}</td>
                    <td>{restaurante.telefone}</td>
                    <td>{restaurante.totalPratos}</td>
                    <td>{restaurante.totalPedidos}</td>
                    <td>⭐ {restaurante.notaMedia.toFixed(1)}</td>
                    <td>
                      <span className={`badge ${restaurante.ativo ? 'badge-success' : 'badge-danger'}`}>
                        {restaurante.ativo ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba: Todos os Usuários */}
      {abaSelecionada === 'usuarios' && (
        <div className="lista-completa">
          <div className="header-com-filtros">
            <h2>👥 Todos os Usuários ({todosUsuarios.length})</h2>
            <div className="filtros">
              <label>
                Status:
                <select 
                  value={filtroUsuarioAtivo} 
                  onChange={(e) => { setFiltroUsuarioAtivo(e.target.value); }}
                  className="filtro-select"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
              </label>
              <button onClick={carregarDados} className="btn-filtrar">
                🔍 Filtrar
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Auth</th>
                  <th>Pedidos</th>
                  <th>Verificado</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {todosUsuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>#{usuario.id}</td>
                    <td>
                      <div className="user-info">
                        {usuario.fotoPerfil && (
                          <img src={usuario.fotoPerfil} alt={usuario.nome} className="user-avatar" />
                        )}
                        <strong>{usuario.nome}</strong>
                      </div>
                    </td>
                    <td>
                      {usuario.email || '-'}
                      {usuario.emailVerificado && <span className="badge badge-mini">✓ Email</span>}
                    </td>
                    <td>
                      {usuario.telefone || '-'}
                      {usuario.telefoneVerificado && <span className="badge badge-mini">✓ Tel</span>}
                    </td>
                    <td>
                      {usuario.googleId && <span className="badge badge-google">{usuario.googleId}</span>}
                      {usuario.facebookId && <span className="badge badge-facebook">{usuario.facebookId}</span>}
                      {!usuario.googleId && !usuario.facebookId && <span className="badge badge-default">📧 Email</span>}
                    </td>
                    <td className="text-center">{usuario.totalPedidos}</td>
                    <td>
                      <span className={`badge ${usuario.verificado ? 'badge-success' : 'badge-warning'}`}>
                        {usuario.verificado ? '✅ Sim' : '⏳ Não'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${usuario.ativo ? 'badge-success' : 'badge-danger'}`}>
                        {usuario.ativo ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td>{formatarData(usuario.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
