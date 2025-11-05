import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import AutocompleteEndereco from "../AutocompleteEndereco";
import "./GerenciarPerfil.css";

export default function GerenciarPerfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [enderecos, setEnderecos] = useState([]);
  const [mostrarFormEndereco, setMostrarFormEndereco] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: ""
  });
  const [formEndereco, setFormEndereco] = useState({
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    complemento: "",
    apelido: ""
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        nome: parsedUser.nome || "",
        email: parsedUser.email || "",
        telefone: parsedUser.telefone || ""
      });
      carregarEnderecos();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      navigate('/login');
    }
  }, [navigate]);

  const carregarEnderecos = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/api/usuarios/enderecos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.sucesso) {
        setEnderecos(data.enderecos || []);
      } else if (data.erro && (data.erro.includes('Token') || data.erro.includes('expirado'))) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    }
  };  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${user.id}`, {
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

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    setFormEndereco(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceSelected = (addressData) => {
    setFormEndereco(prev => ({
      ...prev,
      ...addressData
    }));
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    setFormEndereco(prev => ({ ...prev, cep: cep }));
    setErroCep('');

    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErroCep('❌ CEP não encontrado');
        return;
      }

      setFormEndereco(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
        cep: cep
      }));

      setErroCep('✅ CEP encontrado!');
      setTimeout(() => setErroCep(''), 3000);

    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setErroCep('❌ Erro ao buscar CEP');
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e) => {
    const cep = e.target.value;
    buscarCep(cep);
  };

  const salvarEndereco = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        navigate('/login');
        return;
      }
      
      const url = enderecoEditando 
        ? `http://localhost:3000/api/usuarios/enderecos/${enderecoEditando.id}`
        : `${API_BASE_URL}/api/usuarios/enderecos';
      
      const method = enderecoEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formEndereco)
      });

      const data = await response.json();

      if (data.sucesso) {
        alert(enderecoEditando ? 'Endereço atualizado com sucesso!' : 'Endereço cadastrado com sucesso!');
        setMostrarFormEndereco(false);
        setEnderecoEditando(null);
        setFormEndereco({
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          complemento: "",
          apelido: ""
        });
        await carregarEnderecos();
      } else {
        if (data.erro && (data.erro.includes('Token') || data.erro.includes('expirado'))) {
          alert('Sessão expirada. Por favor, faça login novamente.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          navigate('/login');
          return;
        }
        throw new Error(data.erro || 'Erro ao salvar endereço');
      }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      alert(error.message || 'Erro ao salvar endereço. Tente novamente.');
    }
  };

  const editarEndereco = (endereco) => {
    setEnderecoEditando(endereco);
    setFormEndereco({
      logradouro: endereco.logradouro || "",
      numero: endereco.numero || "",
      bairro: endereco.bairro || "",
      cidade: endereco.cidade || "",
      estado: endereco.estado || "",
      cep: endereco.cep || "",
      complemento: endereco.complemento || "",
      apelido: endereco.apelido || ""
    });
    setMostrarFormEndereco(true);
  };

  const excluirEndereco = async (enderecoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este endereço?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/usuarios/enderecos/${enderecoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.sucesso) {
        alert('Endereço excluído com sucesso!');
        carregarEnderecos();
      } else {
        throw new Error(data.erro || 'Erro ao excluir endereço');
      }
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      alert('Erro ao excluir endereço: ' + error.message);
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
    <div className="perfil-container">
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
          
          <button 
            className="action-button"
            onClick={() => {
              setMostrarFormEndereco(!mostrarFormEndereco);
              setEnderecoEditando(null);
              setFormEndereco({
                logradouro: "",
                numero: "",
                bairro: "",
                cidade: "",
                estado: "",
                cep: "",
                complemento: "",
                apelido: ""
              });
            }}
          >
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

        {/* Seção de Endereços */}
        {mostrarFormEndereco && (
          <div className="perfil-card">
            <h2>{enderecoEditando ? 'Editar Endereço' : 'Cadastrar Novo Endereço'}</h2>
            
            <div className="perfil-form">
              <div className="form-group cep-busca-section">
                <label>CEP *</label>
                <input
                  type="text"
                  name="cep"
                  value={formEndereco.cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  maxLength="9"
                  required
                />
                {buscandoCep && (
                  <p className="cep-status buscando">🔍 Buscando CEP...</p>
                )}
                {erroCep && (
                  <p className={`cep-status ${erroCep.includes('✅') ? 'sucesso' : 'erro'}`}>
                    {erroCep}
                  </p>
                )}
              </div>

              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div className="form-group">
                  <label>Buscar Endereço</label>
                  <AutocompleteEndereco onPlaceSelected={handlePlaceSelected} />
                </div>
              )}

              <div className="form-group">
                <label>Apelido (Casa, Trabalho, etc)</label>
                <input
                  type="text"
                  name="apelido"
                  value={formEndereco.apelido}
                  onChange={handleEnderecoChange}
                  placeholder="Ex: Casa, Trabalho"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Logradouro *</label>
                  <input
                    type="text"
                    name="logradouro"
                    value={formEndereco.logradouro}
                    onChange={handleEnderecoChange}
                    placeholder="Rua, Avenida, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Número *</label>
                  <input
                    type="text"
                    name="numero"
                    value={formEndereco.numero}
                    onChange={handleEnderecoChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formEndereco.complemento}
                  onChange={handleEnderecoChange}
                  placeholder="Apto, Bloco, etc."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    name="bairro"
                    value={formEndereco.bairro}
                    onChange={handleEnderecoChange}
                    placeholder="Bairro"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formEndereco.cidade}
                    onChange={handleEnderecoChange}
                    placeholder="Cidade"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Estado *</label>
                <input
                  type="text"
                  name="estado"
                  value={formEndereco.estado}
                  onChange={handleEnderecoChange}
                  placeholder="SP"
                  maxLength="2"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ponto de Referência</label>
                <input
                  type="text"
                  name="pontoReferencia"
                  value={formEndereco.pontoReferencia}
                  onChange={handleEnderecoChange}
                  placeholder="Ex: Próximo ao mercado"
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => {
                    setMostrarFormEndereco(false);
                    setEnderecoEditando(null);
                  }} 
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button onClick={salvarEndereco} className="btn-save">
                  {enderecoEditando ? 'Atualizar' : 'Salvar'} Endereço
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Endereços Salvos */}
        <div className="perfil-card">
          <h2>Meus Endereços</h2>
          
          {enderecos.length === 0 ? (
            <div className="enderecos-vazio">
              <p>📍 Você ainda não tem endereços cadastrados.</p>
              <p>Clique em "Cadastrar Novo Endereço" para adicionar um.</p>
            </div>
          ) : (
            <div className="enderecos-lista">
              {enderecos.map((endereco) => (
                <div key={endereco.id} className="endereco-item">
                  <div className="endereco-info">
                    {endereco.apelido && (
                      <span className="endereco-apelido">📍 {endereco.apelido}</span>
                    )}
                    <p className="endereco-completo">
                      {endereco.logradouro}, {endereco.numero}
                      {endereco.complemento && ` - ${endereco.complemento}`}
                    </p>
                    <p className="endereco-detalhes">
                      {endereco.bairro}, {endereco.cidade} - {endereco.estado}
                    </p>
                    <p className="endereco-cep">CEP: {endereco.cep}</p>
                  </div>
                  <div className="endereco-actions">
                    <button 
                      onClick={() => editarEndereco(endereco)}
                      className="btn-editar-endereco"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => excluirEndereco(endereco.id)}
                      className="btn-excluir-endereco"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
