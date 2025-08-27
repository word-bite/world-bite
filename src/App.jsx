import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="app">
      <div className="content">
        <h1 className="headline">Venha provar o mundo</h1>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/600px-The_Earth_seen_from_Apollo_17.jpg"
          alt="Planeta Terra"
          className="earth"
        />
        <div className="buttons">
          <button onClick={() => setShowLogin(true)}>Entrar</button>
          <button onClick={() => setShowRegister(true)}>Cadastro</button>
        </div>
      </div>

      {showLogin && (
        <div className="modal">
          <div className="modal-content">
            <h2>Login</h2>
            <input type="email" placeholder="E-mail" />
            <input type="password" placeholder="Senha" />
            <button>Entrar</button>
            <span onClick={() => setShowLogin(false)}>Fechar</span>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cadastro</h2>
            <input type="text" placeholder="Nome" />
            <input type="email" placeholder="E-mail" />
            <input type="password" placeholder="Senha" />
            <input type="password" placeholder="Confirmar Senha" />
            <button>Cadastrar</button>
            <span onClick={() => setShowRegister(false)}>Fechar</span>
          </div>
        </div>
      )}
    </div>
  );
}
