import React from "react";
import { Link } from "react-router-dom";
import "./TelaEmpresa.css";

export default function TelaEmpresa() {
  return (
    <div className="tela-empresa-bg">
      <div className="tela-empresa-container">
        <h1 className="tela-empresa-headline">Área da Empresa</h1>
        <p className="tela-empresa-subtitle">
          Escolha uma opção para continuar
        </p>
        <div className="tela-empresa-opcoes">
          <Link to="/cadastro-restaurante">
            <button className="tela-empresa-btn">Cadastro de Restaurante</button>
          </Link>
          <Link to="/painel-restaurante">
            <button className="tela-empresa-btn">Painel do Restaurante</button>
          </Link>
          <Link to="/cadastro-prato">
            <button className="tela-empresa-btn">Cadastrar Pratos</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
