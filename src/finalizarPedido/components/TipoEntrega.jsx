import React, { useState } from "react";
import "./TipoEntrega.css";

export default function TipoEntrega({ onChange }) {
  const [selecionado, setSelecionado] = useState("moto");

  const alterar = (tipo) => {
    setSelecionado(tipo);
    if (onChange) onChange(tipo);
  };

  return (
    <div className="tipo-entrega-box">
      <h3>Tipo de entrega</h3>

      <div className="opcoes-entrega">

        <div
          className={`opcao-item ${selecionado === "moto" ? "ativo" : ""}`}
          onClick={() => alterar("moto")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/741/741407.png"
            alt="Moto"
          />
          <span>Moto</span>
        </div>

        <div
          className={`opcao-item ${selecionado === "bike" ? "ativo" : ""}`}
          onClick={() => alterar("bike")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png"
            alt="Bicicleta"
          />
          <span>Bicicleta</span>
        </div>

      </div>
    </div>
  );
}
