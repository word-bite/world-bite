import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPageRestaurante.css";

export default function LoginPageRestaurante() {
  const [cnpj, setCnpj] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/send-verification-code', {
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

  const handleVerifySms = async (e) => {
    e.preventDefault();
    
    try {
      // O backend precisa do CNPJ para encontrar o código salvo
      const response = await fetch('http://localhost:3000/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CORREÇÃO: Usar .trim() para remover espaços em branco
        body: JSON.stringify({ cnpj: cnpj, code: smsCode.trim() }), 
      });

      const data = await response.json();

      // CORREÇÃO: Verificação da resposta
      if (response.ok) {
        alert(data.message);
        navigate('/painel-do-restaurante');
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
      <div className="bg-img" aria-hidden="true"></div>
      <div className="center-container">
        <div className="login-card">
          <h1 className="login-headline">Login para Restaurantes</h1>
          <form className="login-form" onSubmit={handleLogin}>
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
            <button type="submit" className="login-btn">
              Entrar
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
            <p>Um código de 4 dígitos foi enviado para o telefone cadastrado.</p>
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