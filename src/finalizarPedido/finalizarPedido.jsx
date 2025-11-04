import React from "react";
import "./finalizarPedido.css";

import EnderecoEntrega from "./components/EnderecoEntrega";
import MetodoPagamento from "./components/MetodoPagamento";
import Cupom from "./components/Cupom";
import ResumoPedido from "./components/ResumoPedido";
import TipoEntrega from "./components/TipoEntrega";

export default function FinalizarPedido() {
  return (
    <div className="sacola-container">
      {/* COLUNA ESQUERDA */}
      <div className="col-esquerda">
        <h1>Finalize seu pedido</h1>

        <EnderecoEntrega />
        <MetodoPagamento />
        <TipoEntrega />
        <Cupom />

        <div className="cpf-field">
          <label>CPF/CNPJ na nota</label>
          <input type="text" placeholder="Digite seu CPF ou CNPJ" />
        </div>

        <button className="botao-finalizar">Fazer pedido</button>
      </div>

      {/* COLUNA DIREITA */}
      <div className="col-direita">
        <ResumoPedido />
      </div>
    </div>
  );
}
