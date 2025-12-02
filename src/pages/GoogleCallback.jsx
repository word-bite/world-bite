import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../loginPage/login.css';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processando login com Google...');

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        // Verificar se há erro
        const error = searchParams.get('error');
        if (error) {
          setStatus('error');
          setMessage('❌ Erro na autenticação com Google. Tente novamente.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Obter token e dados do usuário da URL
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (!token || !userParam) {
          setStatus('error');
          setMessage('❌ Dados de autenticação inválidos.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Parse dos dados do usuário
        const usuario = JSON.parse(decodeURIComponent(userParam));

        // Salvar no localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(usuario));

        setStatus('success');
        setMessage(`✅ Login realizado com sucesso! Bem-vindo, ${usuario.nome}!`);

        // Redirecionar para a página do cliente
        setTimeout(() => {
          navigate('/cliente');
        }, 2000);

      } catch (error) {
        console.error('Erro ao processar callback do Google:', error);
        setStatus('error');
        setMessage('❌ Erro ao processar autenticação. Redirecionando...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="bg-img" aria-hidden="true">
      <div className="center-container">
        <div className="login-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className={`callback-status status-${status}`}>
            {status === 'processing' && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}
            <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              {status === 'processing' && '🔄 Processando...'}
              {status === 'success' && '✅ Sucesso!'}
              {status === 'error' && '❌ Erro'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#4a5568' }}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
