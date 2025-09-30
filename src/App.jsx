import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// IMPORTANTE: Importe o PrivateRoute
import { PrivateRoute } from "./components/PrivateRoute"; 

import LoginPage from "./loginPage/login";
import LoginPageRestaurante from "./loginpagerestaurante/LoginPageRestaurante";
import CadastroRestaurante from "./CadastroRestaurante/CadastroRestaurante";
import TelaEmpresa from "./TelaEmpresa/TelaEmpresa";
import PainelRestaurante from "./empresas/PainelRestaurante";
import CadastroPrato from "./empresas/CadastroPrato";
// 🔑 NOVIDADE: Importe o componente GerenciarCardapio
import GerenciarCardapio from "./empresas/GerenciarCardapio"; 
import Pedido from "./pedidos/pedidos";
import Home from "./Home/home";
import PageCliente from "./pageCliente/pageCliente";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ROTAS PÚBLICAS (Acesso Livre) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-restaurante" element={<LoginPageRestaurante />} />
        <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/cliente" element={<PageCliente />} />

        {/* ROTAS PROTEGIDAS PELA SESSÃO DO RESTAURANTE */}
        <Route element={<PrivateRoute />}>
          
          <Route path="/tela-empresa" element={<TelaEmpresa />} />
          <Route path="/painel-restaurante" element={<PainelRestaurante />} />
          <Route path="/cadastro-prato" element={<CadastroPrato />} />
          
          {/* 🔑 NOVIDADE: Rota para o Gerenciamento de Cardápio (CRUD) */}
          <Route path="/gerenciar-cardapio" element={<GerenciarCardapio />} />

        </Route>
        
      </Routes>
    </Router>
  );
}