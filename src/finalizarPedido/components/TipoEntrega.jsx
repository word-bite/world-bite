import React, { useState } from "react";
import "./TipoEntrega.css";

export default function TipoEntrega({ onChange }) {
  const [selecionado, setSelecionado] = useState("entrega");

  const alterar = (tipo) => {
    setSelecionado(tipo);
    if (onChange) onChange(tipo);
  };

  return (
    <div className="tipo-entrega-box">
      <h3>Tipo de entrega</h3>

      <div className="opcoes-entrega">

        <div
          className={`opcao-item ${selecionado === "entrega" ? "ativo" : ""}`}
          onClick={() => alterar("entrega")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/741/741407.png"
            alt="Entrega"
          />
          <span>Entrega</span>
        </div>

        <div
          className={`opcao-item ${selecionado === "retirada" ? "ativo" : ""}`}
          onClick={() => alterar("retirada")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3514/3514242.png"
            alt="Retirar na loja"
          />
          <span>Retirar na loja</span>
        </div>

      </div>
    </div>
  );
}
