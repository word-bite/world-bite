import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  return (
    <div className="center-container">
      <div className="login-card">
        <h1 className="login-headline">Bem-vindo à Home!</h1>
        <p style={{ marginBottom: 32, color: "#234236" }}>
          Escolha uma opção para continuar:
        </p>
        <Link
          to="/login"
          className="login-btn small"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Ir para Login
        </Link>
        <Link
          to="/cadastro-restaurante"
          className="login-btn small"
          style={{ textAlign: "center", background: "#e0f7e9", color: "#234236" }}
        >
          Cadastrar Restaurante
        </Link>
      </div>
    </div>
  );
}