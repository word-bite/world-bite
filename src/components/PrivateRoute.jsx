import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Verifica se string é um JWT (3 partes) e se exp não expirou
function isTokenValid(token) {
    try {
        if (typeof token !== 'string') return false;
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        if (!payload || typeof payload !== 'object') return false;
        if (!payload.exp) return true;
        return Date.now() < payload.exp * 1000;
    } catch {
        return false;
    }
}

// Tenta extrair um token de vários locais/formatos comuns (inclui auth_token e objetos user_data)
function findToken() {
    const keysToCheck = [
        'token', 'tokenCliente', 'userToken', 'accessToken',
        'tokenRestaurante', 'restauranteToken', 'jwt', 'authToken', 'auth_token'
    ];

    // 1) localStorage
    for (const k of keysToCheck) {
        const v = localStorage.getItem(k);
        if (v) return { key: k, token: v, source: 'localStorage' };
    }

    // 2) sessionStorage
    for (const k of keysToCheck) {
        const v = sessionStorage.getItem(k);
        if (v) return { key: k, token: v, source: 'sessionStorage' };
    }

    // 3) Possível objeto JSON salvo (ex.: "usuario" / "user_data" contendo token/auth_token)
    const maybeObjKeys = ['usuario', 'user', 'auth', 'authData', 'user_data'];
    for (const k of maybeObjKeys) {
        const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
        if (!raw) continue;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                // diferentes propriedades possíveis dentro do objeto
                if (parsed.token) return { key: `${k}.token`, token: parsed.token, source: k };
                if (parsed.auth_token) return { key: `${k}.auth_token`, token: parsed.auth_token, source: k };
                if (parsed.accessToken) return { key: `${k}.accessToken`, token: parsed.accessToken, source: k };
                // algumas implementações guardam token dentro de user.token ou data.token
                if (parsed.user && parsed.user.token) return { key: `${k}.user.token`, token: parsed.user.token, source: k };
                if (parsed.data && parsed.data.token) return { key: `${k}.data.token`, token: parsed.data.token, source: k };
            }
        } catch { /* não é JSON */ }
    }

    return null;
}

// Componente de guarda de rotas
export const PrivateRoute = ({ requiredRole }) => {
  const found = findToken();
  const token = found ? found.token : null;

  // tokens / flags específicos de restaurante
  const restauranteFlag = localStorage.getItem('restauranteLogado') === 'true' || sessionStorage.getItem('restauranteLogado') === 'true';
  const restauranteToken = localStorage.getItem('tokenRestaurante') || sessionStorage.getItem('tokenRestaurante') || localStorage.getItem('restauranteToken');

  const clienteOk = token && isTokenValid(token);
  const restauranteOk = restauranteFlag || (restauranteToken && isTokenValid(restauranteToken));

  // DEBUG (apenas em dev) — útil para ver qual chave está sendo lida
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[PrivateRoute] token check', {
      found,
      clienteOk,
      restauranteOk,
      restauranteFlag,
      ls_keys: {
        token: !!localStorage.getItem('token'),
        auth_token: !!localStorage.getItem('auth_token'),
        user_data: !!localStorage.getItem('user_data'),
        tokenCliente: !!localStorage.getItem('tokenCliente'),
        tokenRestaurante: !!localStorage.getItem('tokenRestaurante')
      }
    });
  }

  if (requiredRole === 'cliente') {
    if (clienteOk) return <Outlet />;
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'restaurante') {
    if (restauranteOk) return <Outlet />;
    return <Navigate to="/login-restaurante" replace />;
  }

  if (clienteOk || restauranteOk) return <Outlet />;

  return <Navigate to="/login" replace />;
};