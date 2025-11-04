import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerenciarPerfil.css";

export default function GerenciarPerfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          nome: parsedUser.nome || "",
          email: parsedUser.email || "",
          telefone: parsedUser.telefone || ""
        });
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.sucesso) {
        // Atualizar localStorage com novos dados
        const updatedUser = { ...user, ...data.usuario };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      } else {
        throw new Error(data.erro || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao atualizar perfil: ' + error.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CL';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (!user) {
    return (
      <div className="perfil-loading">
        <div className="spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-container" style={{ overflowY: 'auto', height: '100vh' }}>
      <header className="perfil-header">
        <button onClick={() => navigate('/cliente')} className="back-button">
          ← Voltar
        </button>
        <h1>Meu Perfil</h1>
        <div></div>
      </header>

      <main className="perfil-main">
        <div className="perfil-card">
          <div className="perfil-avatar-section">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                className="perfil-avatar-large"
              />
            ) : (
              <div className="perfil-avatar-large">
                {getInitials(user.nome)}
              </div>
            )}
            {user.provider && (
              <span className="perfil-provider-badge">
                {user.provider === 'facebook' && '🔵 Facebook'}
                {user.provider === 'google' && '🔴 Google'}
                {!['facebook', 'google'].includes(user.provider) && '📧 Email/SMS'}
              </span>
            )}
          </div>

          <div className="perfil-info-section">
            {isEditing ? (
              <div className="perfil-form">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu.email@exemplo.com"
                    disabled={user.provider === 'facebook' || user.provider === 'google'}
                  />
                  {(user.provider === 'facebook' || user.provider === 'google') && (
                    <small>Email vinculado à conta social não pode ser alterado</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>

                <div className="form-actions">
                  <button onClick={() => setIsEditing(false)} className="btn-cancel">
                    Cancelar
                  </button>
                  <button onClick={handleSave} className="btn-save">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            ) : (
              <div className="perfil-display">
                <div className="info-item">
                  <span className="info-label">Nome</span>
                  <span className="info-value">{user.nome}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email || 'Não informado'}</span>
                  {user.email_verificado && <span className="verified-badge">✓ Verificado</span>}
                </div>

                <div className="info-item">
                  <span className="info-label">Telefone</span>
                  <span className="info-value">{user.telefone || 'Não informado'}</span>
                  {user.telefone_verificado && <span className="verified-badge">✓ Verificado</span>}
                </div>

                <div className="info-item">
                  <span className="info-label">Membro desde</span>
                  <span className="info-value">
                    {new Date(user.data_criacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {user.ultimo_login && (
                  <div className="info-item">
                    <span className="info-label">Último acesso</span>
                    <span className="info-value">
                      {new Date(user.ultimo_login).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  ✏️ Editar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="perfil-actions-card">
          <h2>Ações da Conta</h2>
          
          <button className="action-button">
            📍 Gerenciar Endereços
          </button>
          
          <button className="action-button">
            🎟️ Meus Cupons
          </button>
          
          <button className="action-button">
            📦 Histórico de Pedidos
          </button>
          
          <button className="action-button">
            💳 Formas de Pagamento
          </button>
          
          <button className="action-button danger" onClick={handleLogout}>
            🚪 Sair da Conta
          </button>
        </div>
      </main>
    </div>
  );
}
