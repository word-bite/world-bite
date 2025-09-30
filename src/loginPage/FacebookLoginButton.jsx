// src/loginPage/FacebookLoginButton.jsx
// Componente integrado para usar na página de login existente

import React, { useState } from 'react';

const FacebookLoginButton = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:3000';

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // URL de redirecionamento
      const redirectUri = `${window.location.origin}/auth/facebook/callback`;

      console.log('🚀 Iniciando login Facebook...');

      // 1. Obter URL de autorização do backend
      const response = await fetch(
        `${API_BASE_URL}/api/auth/facebook/url?redirect_uri=${encodeURIComponent(redirectUri)}`
      );

      if (!response.ok) {
        throw new Error('Erro ao obter URL de autorização');
      }

      const data = await response.json();

      if (data.sucesso) {
        console.log('📍 Redirecionando para Facebook...');
        // 2. Redirecionar para o Facebook
        window.location.href = data.auth_url;
      } else {
        throw new Error(data.erro || 'Erro ao gerar URL de login');
      }

    } catch (error) {
      console.error('❌ Erro no login Facebook:', error);
      setError(error.message);
      if (onLoginError) onLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleFacebookLogin}
        disabled={isLoading}
        className="login-btn facebook"
      >
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continuar com Facebook
          </>
        )}
      </button>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </>
  );
};

export default FacebookLoginButton;