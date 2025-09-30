// src/examples/FacebookLoginExample.jsx
// Exemplo de como usar o componente FacebookLogin

import React, { useState } from 'react';
import FacebookLogin from '../components/FacebookLogin/FacebookLogin';

const FacebookLoginExample = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar se já está logado
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (result) => {
    console.log('✅ Login bem-sucedido:', result);
    setUser(result.user);
    setIsLoggedIn(true);
    
    if (result.isNewUser) {
      alert('Bem-vindo! Sua conta foi criada com sucesso.');
    } else {
      alert(`Bem-vindo de volta, ${result.user.nome}!`);
    }
  };

  const handleLoginError = (error) => {
    console.error('❌ Erro no login:', error);
    alert(`Erro no login: ${error}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn && user) {
    return (
      <div className="user-profile">
        <h2>✅ Usuário Logado</h2>
        <div className="user-info">
          {user.avatar_url && (
            <img 
              src={user.avatar_url} 
              alt="Avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '50%' }}
            />
          )}
          <p><strong>Nome:</strong> {user.nome}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Provider:</strong> {user.provider}</p>
          <p><strong>Email verificado:</strong> {user.email_verificado ? '✅' : '❌'}</p>
        </div>
        <button onClick={handleLogout}>Sair</button>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h1>Login World Bite</h1>
      <p>Faça login com sua conta do Facebook:</p>
      
      <FacebookLogin
        onLoginSuccess={handleLoginSuccess}
        onLoginError={handleLoginError}
      />
      
      <div className="login-info">
        <h3>🔍 Como funciona:</h3>
        <ol>
          <li>Clique em "Continuar com Facebook"</li>
          <li>Autorize as permissões no Facebook</li>
          <li>Seja redirecionado de volta para o app</li>
          <li>Login automático com seus dados do Facebook</li>
        </ol>
      </div>
    </div>
  );
};

export default FacebookLoginExample;