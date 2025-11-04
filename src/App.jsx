import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// IMPORTANTE: Importe o PrivateRoute (Idealmente, este PrivateRoute verifica o token do USUÁRIO/CLIENTE)
import { PrivateRoute } from "./components/PrivateRoute"; 
import PerfilCliente from './pageCliente/perfilCliente.jsx';
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
import PainelChamadas from "./empresas/PainelChamadas";
import FinalizarPedido from "./finalizarPedido/finalizarPedido";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ------------------------------------------------------------------ */}
        {/* ROTAS PÚBLICAS (Acesso Livre) */}
        {/* ------------------------------------------------------------------ */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/login-restaurante" element={<LoginPageRestaurante />} />
        <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
        <Route path="/facebook-callback" element={<FacebookCallback />} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/cliente" element={<PageCliente />} />
        <Route path="/finalizar-pedido" element={<FinalizarPedido />} />


        {/* ------------------------------------------------------------------ */}
        {/* ROTAS PROTEGIDAS PELO JWT DO CLIENTE (Usuário) */}
        {/* ------------------------------------------------------------------ */}
        {/*           ⚠️ NOTA: Seu componente PrivateRoute deve ser flexível para
          verificar tanto o token do Cliente quanto o token do Restaurante.
          Se você tiver tokens diferentes, precisará de dois PrivateRoutes 
          ou um componente flexível. 
        */}
        
        <Route element={<PrivateRoute requiredRole="cliente" />}>
          {/* Perfil e Endereços do Cliente */}
          <Route path="/perfil-cliente" element={<PerfilCliente />} />
        </Route>

        {/* ------------------------------------------------------------------ */}
        {/* ROTAS PROTEGIDAS PELO JWT DO RESTAURANTE (Empresa) */}
        {/* ------------------------------------------------------------------ */}
        <Route element={<PrivateRoute requiredRole="restaurante" />}>
          
          <Route path="/tela-empresa" element={<TelaEmpresa />} />
          <Route path="/painel-restaurante" element={<PainelRestaurante />} />
          <Route path="/cadastro-prato" element={<CadastroPrato />} />

           {/* ROTA PARA GERENCIAR PEDIDOS */}
          <Route path="/aceitar-recusar-pedidos" element={<AceitarRecusarPedidos />} />
          
          {/* 🔑 Painel de Chamadas de Retirada */}
          <Route path="/painel-chamadas" element={<PainelChamadas />} />
         
          {/* 🔑 Rota para o Gerenciamento de Cardápio (CRUD) */}
          <Route path="/gerenciar-cardapio" element={<GerenciarCardapio />} />

        </Route>
        
      </Routes>
    </Router>
  );
}