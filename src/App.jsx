import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./loginPage/login";
import LoginPageRestaurante from "./loginpagerestaurante/LoginPageRestaurante"; // Caminho corrigido
import CadastroRestaurante from "./CadastroRestaurante/CadastroRestaurante";
import Home from "./Home/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-restaurante" element={<LoginPageRestaurante />} />
        <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
      </Routes>
    </Router>
  );
}