import React from "react";
import "./pedidos.css";

const Pedido = () => {
  const pedidos = [
    {
      id: 7250,
      restaurante: "Padaria Real - Pinheiros",
      status: "Pedido concluído",
      itens: ["2x Micro Coxinha de Frango c/ Catupiry Pipoca"],
    },
    {
      id: 7251,
      restaurante: "Pizzaria Bella Itália",
      status: "Pedido concluído",
      itens: ["1x Pizza Calabresa", "1x Coca-Cola 2L"],
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="header">
        {/* Logo */}
        <div className="header-logo">
          <img src="/logo.png" alt="WorldBite Logo" className="logo-img" />
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
        <h3>Histórico</h3>

        {pedidos.map((pedido) => (
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
        ))}
      </main>
    </div>
  );
};

export default Pedido;
