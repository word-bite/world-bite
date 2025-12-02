import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      const redirectUri = `${window.location.origin}/auth/facebook/callback`;
      
      console.log('🚀 Iniciando login Facebook...');
      
      const response = await fetch(
        `${API_BASE_URL}/api/auth/facebook/url?redirect_uri=${encodeURIComponent(redirectUri)}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao obter URL de autorização');
      }
      
      const data = await response.json();
      
      if (data.sucesso) {
        console.log('📍 Redirecionando para Facebook...');
        window.location.href = data.auth_url;
      } else {
        throw new Error(data.erro || 'Erro ao gerar URL de login');
      }
    } catch (error) {
      console.error('❌ Erro no login Facebook:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Iniciando login Google...');
      
      // Redirecionar diretamente para a rota do Google OAuth
      window.location.href = `${API_BASE_URL}/api/auth/google`;
      
    } catch (error) {
      console.error('❌ Erro no login Google:', error);
      alert('Erro ao iniciar login com Google: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setIsLoading(true);
      
      if (step === 'login') {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/codigo-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
          alert(`Código enviado para ${email}! (Código para teste: ${data.codigoParaTeste})`);
          setStep('verify');
        } else {
          throw new Error(data.erro || 'Erro ao enviar código');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            identificador: email, 
            codigo: code 
          })
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.usuario));
          setUser(data.usuario);
          
          // Navegar para a página do cliente após login bem-sucedido
          navigate('/cliente');
        } else {
          throw new Error(data.erro || 'Código inválido');
        }
      }
    } catch (error) {
      console.error('❌ Erro no login por email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    try {
      setIsLoading(true);
      
      if (step === 'login') {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/codigo-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefone: phone })
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
          alert(`Código enviado para ${phone}! (Código para teste: ${data.codigoParaTeste})`);
          setStep('verify');
        } else {
          throw new Error(data.erro || 'Erro ao enviar código');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            identificador: phone, 
            codigo: code 
          })
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.usuario));
          setUser(data.usuario);
          navigate('/cliente');
        } else {
          throw new Error(data.erro || 'Código inválido');
        }
      }
    } catch (error) {
      console.error('❌ Erro no login por telefone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setStep('login');
    setShowEmailForm(false);
    setShowPhoneForm(false);
    setEmail('');
    setPhone('');
    setCode('');
  };

  if (user) {
    return (
      <>
        <Link to="/" className="logo-top-left">
          <img src="/logoNome.jpeg" alt="Logo" />
        </Link>
        <div className="bg-img" aria-hidden="true"></div>
        <div className="bg-img-country1" aria-hidden="true"></div>
        <div className="bg-img-country2" aria-hidden="true"></div>
        <div className="center-container">
          <div className="login-card">
            <h1 className="login-headline">✅ Bem-vindo!</h1>
            <div className="user-info">
              {user.avatar_url && (
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%',
                    border: '3px solid #1877f2',
                    marginBottom: '16px'
                  }}
                />
              )}
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>Email:</strong> {user.email || 'Não informado'}</p>
              <p><strong>Telefone:</strong> {user.telefone || 'Não informado'}</p>
              {user.provider && <p><strong>Provider:</strong> {user.provider}</p>}
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
      </>
    );
  }

  return (
    <>
      <Link to="/" className="logo-top-left">
        <img src="/logoNome.jpeg" alt="Logo" />
      </Link>
      <div className="bg-img" aria-hidden="true"></div>
      <div className="bg-img-country1" aria-hidden="true"></div>
      <div className="bg-img-country2" aria-hidden="true"></div>
      <div className="center-container">
        <div className="login-card">
          <h1 className="login-headline">Entre e descubra um novo mundo</h1>
          <button 
            className="login-btn google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
              alt="Google"
            />
            Continuar com Google
          </button>
          
          <button 
            className="login-btn facebook" 
            onClick={handleFacebookLogin}
            disabled={isLoading}
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
          <div className="divider">
            <span>ou</span>
          </div>

          {showEmailForm && (
            <div className="auth-form">
              <h3>Login com Email</h3>
              {step === 'login' ? (
                <>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                  <button 
                    onClick={handleEmailLogin}
                    disabled={!email || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Código'}
                  </button>
                </>
              ) : (
                <>
                  <p>Código enviado para: <strong>{email}</strong></p>
                  <input
                    type="text"
                    placeholder="Digite o código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="auth-input"
                    maxLength="6"
                  />
                  <button 
                    onClick={handleEmailLogin}
                    disabled={code.length !== 6 || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Verificando...' : 'Fazer Login'}
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  setShowEmailForm(false);
                  setStep('login');
                  setEmail('');
                  setCode('');
                }}
                className="auth-back-btn"
              >
                ← Voltar
              </button>
            </div>
          )}

          {showPhoneForm && (
            <div className="auth-form">
              <h3>Login com Celular</h3>
              {step === 'login' ? (
                <>
                  <input
                    type="tel"
                    placeholder="Digite seu celular (+5511999999999)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                  />
                  <button 
                    onClick={handlePhoneLogin}
                    disabled={!phone || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Código SMS'}
                  </button>
                </>
              ) : (
                <>
                  <p>Código enviado para: <strong>{phone}</strong></p>
                  <input
                    type="text"
                    placeholder="Digite o código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="auth-input"
                    maxLength="6"
                  />
                  <button 
                    onClick={handlePhoneLogin}
                    disabled={code.length !== 6 || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Verificando...' : 'Fazer Login'}
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  setShowPhoneForm(false);
                  setStep('login');
                  setPhone('');
                  setCode('');
                }}
                className="auth-back-btn"
              >
                ← Voltar
              </button>
            </div>
          )}

          {!showEmailForm && !showPhoneForm && (
            <div className="login-btn-row">
              <button 
                className="login-btn small"
                onClick={() => setShowPhoneForm(true)}
              >
                Entrar com Celular
              </button>
              <button 
                className="login-btn small"
                onClick={() => setShowEmailForm(true)}
              >
                Entrar com E-mail
              </button>
            </div>
          )}
          <p className="login-footer">
            Ao continuar, você concorda com os{" "}
            <a href="#">Termos de Uso</a> e a{" "}
            <a href="#">Política de Privacidade</a>.
          </p>
          <Link to="/cadastro-restaurante" className="login-btn small" style={{marginTop: 16, textAlign: "center"}}>
            Cadastrar Restaurante
          </Link>
        </div>
      </div>
    </>
  );
}