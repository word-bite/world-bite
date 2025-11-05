import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPageRestaurante.css";
import "../loginPage/login.css"; // Para os estilos da logo

export default function LoginPageRestaurante() {
  const [cnpj, setCnpj] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const navigate = useNavigate();

  // Função para lidar com o login via SMS (método original)
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cnpj }),
      });
      const data = await response.json();

      if (response.ok) {
        setRequestId(data.requestId);
        setShowModal(true);
      } else {
        alert(data.error || 'Erro ao enviar o código de verificação.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Falha na conexão com o servidor.');
    }
  };

  // 🔑 NOVIDADE: Função para Login Rápido (DEV)
  const handleLoginRapido = async (e) => {
    e.preventDefault();

    if (!cnpj) {
        alert("Digite o CNPJ para usar o Login Rápido.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/login-rapido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cnpj }),
        });
        const data = await response.json();

        if (response.ok) {
            // Exibe a modal e pede o código fixo (1234, conforme configuramos no backend)
            alert(data.message); 
            setShowModal(true);
        } else {
            alert(data.error || 'Erro no Login Rápido. Verifique o CNPJ.');
        }
    } catch (error) {
        console.error('Erro na requisição de Login Rápido:', error);
        alert('Falha na conexão com o servidor de login rápido.');
    }
  };


  // Função para verificar o código SMS
  const handleVerifySms = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cnpj: cnpj, code: smsCode.trim() }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        
        // Limpa o CNPJ
        const cnpjLimpo = cnpj.replace(/[^\d]/g, ''); 
        
        // 🔑 SALVA CNPJ E O NOME (NOVO PASSO)
        localStorage.setItem('restauranteLogado', cnpjLimpo);
        // O backend agora deve retornar data.nomeRestaurante
        localStorage.setItem('restauranteNome', data.nomeRestaurante || 'Restaurante');
        
        // Redireciona para a tela-empresa
        navigate('/tela-empresa');
      } else {
        alert(data.error || 'Código de verificação incorreto.');
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      alert('Falha ao verificar o código.');
    }
  };

  const handleCnpjChange = (e) => {
    setCnpj(e.target.value);
  };

  const handleSmsCodeChange = (e) => {
    setSmsCode(e.target.value);
  };

  return (
    <>
      <Link to="/" className="logo-top-left">
        <img src="/logoNome.jpeg" alt="World Bite Logo" />
      </Link>
      <div className="bg-img" aria-hidden="true"></div>
      <div className="center-container">
        <div className="login-card">
          <h1 className="login-headline">Login para Restaurantes</h1>
          <form className="login-form">
            <label>
              CNPJ
              <input 
                type="text" 
                name="cnpj" 
                value={cnpj} 
                onChange={handleCnpjChange} 
                placeholder="99.999.999/0001-99" 
                required 
              />
            </label>

            {/* Botão de Login SMS original */}
            <button type="submit" onClick={handleLogin} className="login-btn">
              Entrar (via SMS)
            </button>
            
            {/* 🔑 NOVO BOTÃO: Login Rápido (DEV) */}
            <button 
                type="button" 
                onClick={handleLoginRapido} 
                className="login-btn"
                style={{ backgroundColor: '#28a745', marginTop: '10px' }} 
            >
                Login Rápido (DEV)
            </button>

          </form>
          <Link
            to="/cadastro-restaurante"
            className="login-btn small"
            style={{ marginTop: 16, textAlign: "center" }}
          >
            Cadastrar Novo Restaurante
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Digite o Código de Verificação</h3>
            <p>Um código de 4 dígitos foi enviado para o telefone cadastrado. **Para DEV: use 1234**.</p>
            <form onSubmit={handleVerifySms}>
              <input
                type="text"
                value={smsCode}
                onChange={handleSmsCodeChange}
                maxLength="4"
                placeholder="Código SMS"
                required
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-verify">
                  Verificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}