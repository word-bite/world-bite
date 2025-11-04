import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// IMPORTANTE: Importe o PrivateRoute
import { PrivateRoute } from "./components/PrivateRoute"; 

import LoginPage from "./loginPage/login";
import CadastroUsuario from "./pages/CadastroUsuario";
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
import FacebookCallback from "./pages/FacebookCallback";
import AceitarRecusarPedidos from "./empresas/AceitarRecusarPedidos";
import FinalizarPedido from "./finalizarPedido/finalizarPedido";


export default function App() {
  return (
    <Router>
      <Routes>
        {/* ROTAS PÚBLICAS (Acesso Livre) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/login-restaurante" element={<LoginPageRestaurante />} />
        <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
        <Route path="/facebook-callback" element={<FacebookCallback />} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/cliente" element={<PageCliente />} />
        <Route path="/finalizarPedido" element={<FinalizarPedido />} />

        {/* ROTAS PROTEGIDAS PELA SESSÃO DO RESTAURANTE */}
        <Route element={<PrivateRoute />}>
          
          <Route path="/tela-empresa" element={<TelaEmpresa />} />
          <Route path="/painel-restaurante" element={<PainelRestaurante />} />
          <Route path="/cadastro-prato" element={<CadastroPrato />} />

           {/* ROTA PARA GERENCIAR PEDIDOS */}
          <Route path="/aceitar-recusar-pedidos" element={<AceitarRecusarPedidos />} />
         
          {/* 🔑 NOVIDADE: Rota para o Gerenciamento de Cardápio (CRUD) */}
          <Route path="/gerenciar-cardapio" element={<GerenciarCardapio />} />

        </Route>
        
      </Routes>
    </Router>
  );
}