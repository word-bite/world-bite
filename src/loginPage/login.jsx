import React from "react";
import { Link } from "react-router-dom";
import "./login.css";

export default function LoginPage() {
  return (
    <>
      <Link to="/" className="logo-top-left">
        <img src="/logompng.jpeg" alt="Logo" />
      </Link>
      <div className="bg-img" aria-hidden="true"></div>
      <div className="bg-img-country1" aria-hidden="true"></div>
      <div className="bg-img-country2" aria-hidden="true"></div>
      <div className="center-container">
        <div className="login-card">
          <h1 className="login-headline">Entre e descubra um novo mundo</h1>
          <button className="login-btn google">
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
              alt="Google"
            />
            Continuar com Google
          </button>
          <button className="login-btn facebook">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Facebook"
            />
            Continuar com Facebook
          </button>
          <div className="divider">
            <span>ou</span>
          </div>
          <div className="login-btn-row">
            <button className="login-btn small">Entrar com Celular</button>
            <button className="login-btn small">Entrar com E-mail</button>
          </div>
          <p className="login-footer">
            Ao continuar, você concorda com os{" "}
            <a href="#">Termos de Uso</a> e a{" "}
            <a href="#">Política de Privacidade</a>.
          </p>
          <Link to="/cadastro-restaurante" className="login-btn small" style={{marginTop: 16, textAlign: "center"}}>
            Cadastrar Restaurante
          </Link>
        </div>
      </div>
    </>
  );
}