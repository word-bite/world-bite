// src/loginPage/login.jsx - Exemplo de integração do Facebook Login
// Este é um exemplo de como modificar sua página de login existente

import React, { useState, useEffect } from 'react';
import FacebookLoginButton from './FacebookLoginButton';
import './login.css';

const LoginPage = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar se já está logado
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  const handleFacebookSuccess = (result) => {
    console.log('✅ Login Facebook bem-sucedido:', result);
    setUser(result.user);
    setIsLoggedIn(true);
    
    // Redirecionar para dashboard ou página principal
    // window.location.href = '/dashboard';
  };

  const handleFacebookError = (error) => {
    console.error('❌ Erro no login Facebook:', error);
    alert(`Erro no login: ${error}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsLoggedIn(false);
  };

  // Se já está logado, mostrar perfil
  if (isLoggedIn && user) {
    return (
      <div className="solid-bg one-bg-img">
        <div className="bg-img"></div>
        <div className="center-container">
          <div className="login-card">
            <h2>✅ Bem-vindo!</h2>
            <div className="user-info">
              {user.avatar_url && (
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%',
                    border: '3px solid #1877f2'
                  }}
                />
              )}
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Provider:</strong> {user.provider}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="login-btn small"
              style={{ width: '100%', marginTop: '20px' }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página de login
  return (
    <div className="solid-bg one-bg-img">
      <div className="bg-img"></div>
      
      {/* Logo */}
      <div className="logo-top-left">
        <img src="/logoNome.jpeg" alt="World Bite Logo" />
      </div>

      <div className="center-container">
        <div className="login-card">
          <h1 className="login-headline">Entrar no World Bite</h1>

          {/* === FACEBOOK LOGIN === */}
          <FacebookLoginButton
            onLoginSuccess={handleFacebookSuccess}
            onLoginError={handleFacebookError}
          />

          <div className="divider">
            <span>ou</span>
          </div>

          {/* === OUTROS MÉTODOS DE LOGIN === */}
          <button className="login-btn google">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            Continuar com Google
          </button>

          <div className="login-btn-row">
            <button className="login-btn small">
              📧 Email
            </button>
            <button className="login-btn small">
              📱 SMS
            </button>
          </div>

          <div className="login-footer">
            Ao continuar, você concorda com nossos 
            <a href="/termos"> Termos de Uso</a> e 
            <a href="/privacidade"> Política de Privacidade</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;