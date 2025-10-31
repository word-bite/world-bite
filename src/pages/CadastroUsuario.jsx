import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../loginPage/login.css"; // Reutilizar estilos do login

export default function CadastroUsuario() {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('signup'); // 'signup' -> 'verify' -> 'complete'
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:3000';

  // Definir título da página para debug
  React.useEffect(() => {
    document.title = "📝 Cadastro - World Bite";
  }, []);

  const handleFacebookSignup = async () => {
    try {
      setIsLoading(true);
      const redirectUri = `${window.location.origin}/auth/facebook/callback`;
      
      console.log('🚀 Iniciando cadastro com Facebook...');
      
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
        throw new Error(data.erro || 'Erro ao gerar URL de cadastro');
      }
    } catch (error) {
      console.error('❌ Erro no cadastro Facebook:', error);
      alert('Erro ao iniciar cadastro com Facebook: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    try {
      setIsLoading(true);
      
      if (step === 'signup') {
        // Validar dados
        if (!name.trim()) {
          alert('Por favor, digite seu nome completo');
          return;
        }
        if (!email.trim()) {
          alert('Por favor, digite seu email');
          return;
        }

        // Primeiro, cadastrar o usuário
        const cadastroResponse = await fetch(`${API_BASE_URL}/api/usuarios/cadastro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nome: name.trim(),
            email: email.trim()
          })
        });
        
        const cadastroData = await cadastroResponse.json();
        
        if (cadastroData.sucesso) {
          // Agora enviar código de verificação
          const codigoResponse = await fetch(`${API_BASE_URL}/api/usuarios/codigo-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() })
          });
          
          const codigoData = await codigoResponse.json();
          
          if (codigoData.sucesso) {
            alert(`Código de verificação enviado para ${email}! Verifique seu email.`);
            setStep('verify');
          } else {
            throw new Error(codigoData.erro || 'Erro ao enviar código');
          }
        } else if (cadastroResponse.status === 409) {
          // Usuário já existe, apenas enviar código
          const codigoResponse = await fetch(`${API_BASE_URL}/api/usuarios/codigo-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() })
          });
          
          const codigoData = await codigoResponse.json();
          
          if (codigoData.sucesso) {
            alert(`Este email já está cadastrado. Código de verificação enviado para ${email}! Verifique seu email.`);
            setStep('verify');
          } else {
            throw new Error(codigoData.erro || 'Erro ao enviar código');
          }
        } else {
          throw new Error(cadastroData.erro || 'Erro no cadastro');
        }
      } else if (step === 'verify') {
        // Verificar código e fazer login
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
          alert(`Bem-vindo, ${data.usuario.nome}! Conta criada com sucesso.`);
          navigate('/cliente'); // Redirecionar para página do cliente
        } else {
          throw new Error(data.erro || 'Código inválido');
        }
      }
    } catch (error) {
      console.error('❌ Erro no cadastro por email:', error);
      alert('Erro no cadastro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignup = async () => {
    try {
      setIsLoading(true);
      
      if (step === 'signup') {
        // Validar dados
        if (!name.trim()) {
          alert('Por favor, digite seu nome completo');
          return;
        }
        if (!phone.trim()) {
          alert('Por favor, digite seu telefone');
          return;
        }

        // Primeiro, cadastrar o usuário
        const cadastroResponse = await fetch(`${API_BASE_URL}/api/usuarios/cadastro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nome: name.trim(),
            telefone: phone.trim()
          })
        });
        
        const cadastroData = await cadastroResponse.json();
        
        if (cadastroData.sucesso) {
          // Agora enviar código de verificação
          const codigoResponse = await fetch(`${API_BASE_URL}/api/usuarios/codigo-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone: phone.trim() })
          });
          
          const codigoData = await codigoResponse.json();
          
          if (codigoData.sucesso) {
            alert(`Código de verificação enviado para ${phone}! Verifique suas mensagens.`);
            setStep('verify');
          } else {
            throw new Error(codigoData.erro || 'Erro ao enviar código');
          }
        } else if (cadastroResponse.status === 409) {
          // Usuário já existe, apenas enviar código
          const codigoResponse = await fetch(`${API_BASE_URL}/api/usuarios/codigo-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone: phone.trim() })
          });
          
          const codigoData = await codigoResponse.json();
          
          if (codigoData.sucesso) {
            alert(`Este telefone já está cadastrado. Código de verificação enviado para ${phone}! Verifique suas mensagens.`);
            setStep('verify');
          } else {
            throw new Error(codigoData.erro || 'Erro ao enviar código');
          }
        } else {
          throw new Error(cadastroData.erro || 'Erro no cadastro');
        }
      } else if (step === 'verify') {
        // Verificar código e fazer login
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
          alert(`Bem-vindo, ${data.usuario.nome}! Conta criada com sucesso.`);
          navigate('/cliente'); // Redirecionar para página do cliente
        } else {
          throw new Error(data.erro || 'Código inválido');
        }
      }
    } catch (error) {
      console.error('❌ Erro no cadastro por telefone:', error);
      alert('Erro no cadastro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('signup');
    setShowEmailForm(false);
    setShowPhoneForm(false);
    setName('');
    setEmail('');
    setPhone('');
    setCode('');
  };

  return (
    <>
      {/* Header de Debug */}
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: '#28a745', 
        color: 'white', 
        padding: '5px 10px', 
        fontSize: '12px', 
        zIndex: 9999,
        textAlign: 'center'
      }}>
        📝 PÁGINA DE CADASTRO - URL: {window.location.pathname}
      </div>
      
      <Link to="/" className="logo-top-left">
        <img src="/logoNome.jpeg" alt="World Bite Logo" />
      </Link>
      <div className="bg-img" aria-hidden="true"></div>
      <div className="bg-img-country1" aria-hidden="true"></div>
      <div className="bg-img-country2" aria-hidden="true"></div>
      <div className="center-container">
        <div className="login-card">
          <h1 className="login-headline">Criar sua conta no World Bite</h1>
          
          <button className="login-btn google">
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
              alt="Google"
            />
            Criar conta com Google
          </button>
          
          <button 
            className="login-btn facebook" 
            onClick={handleFacebookSignup}
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
                Criar conta com Facebook
              </>
            )}
          </button>

          <div className="divider">
            <span>ou</span>
          </div>

          {showEmailForm && (
            <div className="auth-form">
              <h3>Criar conta com Email</h3>
              {step === 'signup' ? (
                <>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                  />
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                  <button 
                    onClick={handleEmailSignup}
                    disabled={!name || !email || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
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
                    onClick={handleEmailSignup}
                    disabled={code.length !== 6 || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar e Entrar'}
                  </button>
                </>
              )}
              <button 
                onClick={resetForm}
                className="auth-back-btn"
              >
                ← Voltar
              </button>
            </div>
          )}

          {showPhoneForm && (
            <div className="auth-form">
              <h3>Criar conta com Celular</h3>
              {step === 'signup' ? (
                <>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                  />
                  <input
                    type="tel"
                    placeholder="Digite seu celular (+5511999999999)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                  />
                  <button 
                    onClick={handlePhoneSignup}
                    disabled={!name || !phone || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
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
                    onClick={handlePhoneSignup}
                    disabled={code.length !== 6 || isLoading}
                    className="auth-submit-btn"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar e Entrar'}
                  </button>
                </>
              )}
              <button 
                onClick={resetForm}
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
                Criar com Celular
              </button>
              <button 
                className="login-btn small"
                onClick={() => setShowEmailForm(true)}
              >
                Criar com E-mail
              </button>
            </div>
          )}

          <p className="login-footer">
            Ao criar uma conta, você concorda com os{" "}
            <a href="#">Termos de Uso</a> e a{" "}
            <a href="#">Política de Privacidade</a>.
          </p>

          <Link to="/login" className="auth-back-btn" style={{marginTop: 16, textAlign: "center"}}>
            Já tem uma conta? Fazer login
          </Link>
        </div>
      </div>
    </>
  );
}