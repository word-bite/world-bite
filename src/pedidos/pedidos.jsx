import React from "react";
import "./pedidos.css";

const Pedido = () => {
  const pedidosAtuais = [
    {
      id: 7301,
      restaurante: "Restaurante da Vila",
      status: "Em preparo",
      itens: ["Prato Feito", "Suco de Laranja"],
    },
  ];

  const historico = [
    {
      id: 7250,
      restaurante: "Padaria Real - Pinheiros",
      status: "Pedido concluído",
      itens: ["Micro Coxinha de Queijo Pipoca"],
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="header">
        {/* Logo */}
        <div className="header-logo">
          <img src="/logoNome.jpeg" alt="World Bite Logo" className="home-logo" />
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

      {/* Conteúdo principal */}
      <main className="pedidos-page">
        <h2>Meus Pedidos</h2>

        {/* Pedidos atuais */}
        <section className="pedidos-atuais">
          <h3>Pedidos Atuais</h3>
          {pedidosAtuais.length === 0 ? (
            <p>Você não tem pedidos em andamento.</p>
          ) : (
            pedidosAtuais.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-info">
                  <h4>{pedido.restaurante}</h4>
                  <p>
                    {pedido.status} • Nº {pedido.id}
                  </p>
                  <ul>
                    {pedido.itens.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="pedido-acoes">
                  <button className="btn-ajuda">Ajuda</button>
                  <button className="btn-sacola">Adicionar à sacola</button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Histórico de pedidos */}
        <section className="historico-container">
          <h3>Histórico</h3>
          {historico.length === 0 ? (
            <p>Você ainda não fez pedidos.</p>
          ) : (
            historico.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-info">
                  <h4>{pedido.restaurante}</h4>
                  <p>
                    {pedido.status} • Nº {pedido.id}
                  </p>
                  <ul>
                    {pedido.itens.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="pedido-acoes">
                  <button className="btn-ajuda">Ajuda</button>
                  <button className="btn-sacola">Adicionar à sacola</button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Pedido;
