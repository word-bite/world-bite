import React from "react";
import { Link } from "react-router-dom";
import "./CadastroRestaurante.css";

export default function CadastroRestaurante() {
  return (
    <div className="cadastro-bg">
      <div className="cadastro-center-container">
        <div className="cadastro-card">
          <h1 className="cadastro-headline">Cadastrar Restaurante</h1>
          <form className="cadastro-form">
            <label>
              Nome do Restaurante
              <input type="text" placeholder="Ex: Sabor do Mundo" required />
            </label>
            <label>
              Endereço
              <input type="text" placeholder="Rua, número, bairro, cidade" required />
            </label>
            <label>
              Tipo de Cozinha
              <input type="text" placeholder="Ex: Italiana, Japonesa..." required />
            </label>
            <label>
              Telefone
              <input type="tel" placeholder="(99) 99999-9999" required />
            </label>
            <label>
              Site ou Instagram
              <input type="url" placeholder="https://..." />
            </label>
            <button type="submit" className="cadastro-btn">Cadastrar</button>
          </form>
          <Link to="/login" className="cadastro-btn" style={{marginTop: 16, background: "#e0f7e9", color: "#234236"}}>
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}