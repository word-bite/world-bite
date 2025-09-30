// src/pages/FacebookCallback.jsx
import React, { useEffect, useState } from 'react';
import { useFacebookCallback } from '../components/FacebookLogin/FacebookLogin';

const FacebookCallback = () => {
  const { processCallback, isProcessing, error } = useFacebookCallback();
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Processar callback automaticamente quando a página carregar
    processCallback(
      (result) => {
        console.log('✅ Login realizado:', result.user);
        setSuccess(true);
        setUserData(result.user);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      },
      (error) => {
        console.error('❌ Erro no login:', error);
      }
    );
  }, []);

  if (isProcessing) {
    return (
      <div className="callback-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Processando login com Facebook...</h2>
          <p>Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="callback-page">
        <div className="error-container">
          <h2>❌ Erro no Login</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (success && userData) {
    return (
      <div className="callback-page">
        <div className="success-container">
          <h2>✅ Login realizado com sucesso!</h2>
          <div className="user-info">
            {userData.avatar_url && (
              <img 
                src={userData.avatar_url} 
                alt="Avatar" 
                className="avatar"
              />
            )}
            <p>Bem-vindo, <strong>{userData.nome}</strong>!</p>
            <p>Email: {userData.email}</p>
          </div>
          <p>Redirecionando em alguns segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-page">
      <div className="loading-container">
        <h2>Carregando...</h2>
      </div>
    </div>
  );
};

export default FacebookCallback;