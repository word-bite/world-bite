import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente que atua como um 'guarda de rota'.
 * Ele verifica se existe um identificador de sessão no localStorage.
 * Se o restaurante estiver logado, permite o acesso (Outlet).
 * Caso contrário, redireciona para a tela de login.
 */
export const PrivateRoute = () => {
  // 1. Tenta recuperar o identificador de sessão
  const isAuthenticated = localStorage.getItem('restauranteLogado');

  // 2. Se a sessão existe, renderiza o componente filho (a tela protegida)
  if (isAuthenticated) {
    return <Outlet />;
  } 
  
  // 3. Se a sessão NÃO existe, redireciona para a página de login
  return <Navigate to="/login-restaurante" replace />;
};