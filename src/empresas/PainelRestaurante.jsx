import React from "react";
import "./empresas.css";

export default function PainelRestaurante() {
  return (
    <div className="page-bg">
      <div className="page-card">
        <h1 className="page-headline">Painel do Restaurante</h1>
        <p className="page-subtitle">Gerencie seu negócio no iFood Empresas</p>

        <div className="painel-grid">
          <button className="painel-btn">📦 Gerenciar Pedidos</button>
          <button className="painel-btn">🍽️ Gerenciar Cardápio</button>
          <button className="painel-btn">🕑 Horários de Funcionamento</button>
          <button className="painel-btn">⭐ Avaliações</button>
          <button className="painel-btn">💳 Pagamentos</button>
          <button className="painel-btn">⚙️ Configurações</button>
        </div>
      </div>
    </div>
  );
}
