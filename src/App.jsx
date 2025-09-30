import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./loginPage/login";
import LoginPageRestaurante from "./loginpagerestaurante/LoginPageRestaurante"; // Caminho corrigido
import CadastroRestaurante from "./CadastroRestaurante/CadastroRestaurante";
import Home from "./Home/Home";
import TelaEmpresa from "./TelaEmpresa/TelaEmpresa";
import PainelRestaurante from "./empresas/PainelRestaurante";
import CadastroPrato from "./empresas/CadastroPrato";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-restaurante" element={<LoginPageRestaurante />} />
        <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
       <Route path="/tela-empresa" element={<TelaEmpresa />} />
       <Route path="/painel-restaurante" element={<PainelRestaurante />} />
        <Route path="/cadastro-prato" element={<CadastroPrato />} />
      </Routes>
    </Router>
  );
}