// src/components/FacebookLogin/FacebookLogin.jsx
import React, { useState } from 'react';
import './FacebookLogin.css';

const FacebookLogin = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // URL base da API (ajuste conforme necessário)
  const API_BASE_URL = 'http://localhost:3000';

  /**
   * 1. INICIAR LOGIN COM FACEBOOK
   * Redireciona para o Facebook para autorização
   */
  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // URL de redirecionamento (onde o Facebook vai retornar)
      const redirectUri = `${window.location.origin}/auth/facebook/callback`;

      console.log('🚀 Iniciando login Facebook...');
      console.log('Redirect URI:', redirectUri);

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

  /**
   * 2. PROCESSAR CÓDIGO DE RETORNO (usar em página de callback)
   * Esta função deve ser chamada na página /auth/facebook/callback
   */
  const handleCallback = async (code, state) => {
    try {
      setIsLoading(true);
      console.log('📱 Processando callback do Facebook...');

      const redirectUri = `${window.location.origin}/auth/facebook/callback`;

      // Enviar código para o backend
      const response = await fetch(`${API_BASE_URL}/api/auth/facebook/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: redirectUri
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        console.log('✅ Login Facebook bem-sucedido!');
        
        // Salvar token no localStorage
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.usuario));
        }

        // Callback de sucesso
        if (onLoginSuccess) {
          onLoginSuccess({
            token: data.token,
            user: data.usuario,
            isNewUser: data.novo_usuario
          });
        }

        // Redirecionar para página principal
        window.location.href = '/';

      } else {
        throw new Error(data.erro || 'Erro no login Facebook');
      }

    } catch (error) {
      console.error('❌ Erro no callback:', error);
      setError(error.message);
      if (onLoginError) onLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="facebook-login">
      <button
        onClick={handleFacebookLogin}
        disabled={isLoading}
        className="facebook-login-btn"
      >
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <svg 
              className="facebook-icon" 
              viewBox="0 0 24 24" 
              width="20" 
              height="20"
            >
              <path 
                fill="#1877f2" 
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
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
    </div>
  );
};

// Hook personalizado para usar em páginas de callback
export const useFacebookCallback = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const processCallback = async (onSuccess, onError) => {
    try {
      setIsProcessing(true);
      setError('');

      // Extrair parâmetros da URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        throw new Error(`Erro do Facebook: ${errorParam}`);
      }

      if (!code) {
        throw new Error('Código de autorização não encontrado');
      }

      console.log('📱 Processando callback do Facebook...');

      const API_BASE_URL = 'http://localhost:3000';
      const redirectUri = `${window.location.origin}/auth/facebook/callback`;

      const response = await fetch(`${API_BASE_URL}/api/auth/facebook/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: redirectUri
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        console.log('✅ Login Facebook bem-sucedido!');
        
        // Salvar dados
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.usuario));

        if (onSuccess) {
          onSuccess({
            token: data.token,
            user: data.usuario,
            isNewUser: data.novo_usuario
          });
        }
      } else {
        throw new Error(data.erro || 'Erro no login Facebook');
      }

    } catch (error) {
      console.error('❌ Erro no callback:', error);
      setError(error.message);
      if (onError) onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { processCallback, isProcessing, error };
};

export default FacebookLogin;