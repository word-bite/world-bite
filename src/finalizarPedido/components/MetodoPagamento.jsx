import React, { useState } from "react";
import "./MetodoPagamento.css";

export default function MetodoPagamento({ onChange }) {
  const [metodo, setMetodo] = useState("pix");

  const selecionar = (tipo) => {
    setMetodo(tipo);
    if (onChange) onChange(tipo);
  };

  return (
    <div className="metodo-pagamento-box">
      <h3>Forma de pagamento</h3>

      <div className="pagamento-opcoes">

        <div
          className={`pagamento-item ${metodo === "pix" ? "ativo" : ""}`}
          onClick={() => selecionar("pix")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" />
          <span>PIX</span>
        </div>

        <div
          className={`pagamento-item ${metodo === "cartao" ? "ativo" : ""}`}
          onClick={() => selecionar("cartao")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/1003/1003985.png" />
          <span>Cartão</span>
        </div>

        <div
          className={`pagamento-item ${metodo === "dinheiro" ? "ativo" : ""}`}
          onClick={() => selecionar("dinheiro")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/2331/2331927.png" />
          <span>Dinheiro</span>
        </div>

      </div>
    </div>
  );
}
