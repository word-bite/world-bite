import React, { useState, useEffect } from 'react';
import './perfilCliente.css'; // Nosso novo CSS
import { FaTrash, FaPlus, FaHome, FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa';

// Importa o novo componente
// OBS: Ajuste o caminho de importação conforme sua estrutura:
// Seu AutocompleteEndereco.jsx está em src/, mas este arquivo está em src/pageCliente/.
// Portanto, o caminho deve ser relativo.
import AutocompleteEndereco from '../AutocompleteEndereco'; 

// Hook customizado para facilitar chamadas à API (token lido dinamicamente a cada requisição)
const useApi = () => {
  const API_BASE_URL = 'http://localhost:3000/api/usuarios';

  const getToken = () => {
    // tenta chaves simples
    let t = localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('tokenCliente') ||
      localStorage.getItem('userToken') ||
      sessionStorage.getItem('auth_token') ||
      sessionStorage.getItem('token');

    // se for object JSON armazenado
    if (!t) {
      const maybe = localStorage.getItem('user_data') || sessionStorage.getItem('user_data') || localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
      if (maybe) {
        try {
          const parsed = JSON.parse(maybe);
          t = parsed?.token || parsed?.auth_token || parsed?.accessToken || t;
        } catch {}
      }
    }
    return t;
  };

  const getAuthHeaders = () => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const handleResponse = async (res) => {
    const text = await res.text().catch(() => '');
    const content = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = (content && (content.erro || content.error || content.message)) || res.statusText || 'Erro na requisição';
      const e = new Error(err);
      e.status = res.status;
      e.body = content;
      throw e;
    }
    return content;
  };

  const get = async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  };

  const post = async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  };

  const del = async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  };

  return { get, post, del };
};


export default function PerfilCliente() {
  const [enderecos, setEnderecos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newEndereco, setNewEndereco] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    apelido: 'Casa' // Apelido padrão
  });

  const api = useApi();

  // Função para buscar os endereços
  const fetchEnderecos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get('/enderecos');
      // servidor retorna { sucesso: true, enderecos: [...] }
      const lista = (data && (data.enderecos || data.endereços)) || [];
      setEnderecos(lista);
    } catch (err) {
      console.error('[PerfilCliente] erro ao buscar endereços', err);
      setError(err.message || 'Erro ao buscar endereços');
      setEnderecos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnderecos();
  }, []);

  // Função para deletar um endereço
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este endereço?')) return;
    try {
      const data = await api.del(`/enderecos/${id}`);
      if (data && data.sucesso) {
        setEnderecos(prev => prev.filter(e => e.id !== id));
      } else {
        throw new Error((data && (data.erro || data.error)) || 'Erro ao excluir');
      }
    } catch (err) {
      alert(`Erro ao excluir: ${err.message || err}`);
    }
  };

  // Função Mágica 🪄: Recebe os dados formatados do componente Autocomplete
  const handlePlaceSelected = (addressData) => {
    console.log('Endereço do Google Maps recebido:', addressData);
    
    // Atualiza o estado do formulário, preenchendo todos os campos que o Google forneceu.
    setNewEndereco(prev => ({
      ...prev,
      ...addressData,
      // O Google não fornece complemento, então é bom garantir que ele esteja vazio ou o usuário preencha.
      complemento: '', 
      // Manter o apelido anterior, se já selecionado.
      apelido: prev.apelido || 'Casa' 
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEndereco(prev => ({ ...prev, [name]: value }));
  };

  // Função para submeter o novo endereço
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação básica para garantir que os campos principais foram preenchidos (seja por autocomplete ou manualmente)
    if (!newEndereco.logradouro || !newEndereco.numero || !newEndereco.cep) {
        alert('Por favor, preencha o endereço, o número e o CEP.');
        return;
    }

    setIsLoading(true);
    try {
      const data = await api.post('/enderecos', newEndereco);
      if (data && data.sucesso) {
        // recarrega a lista do servidor (mais confiável que manipular estado local)
        await fetchEnderecos();
        setShowForm(false);
        // Reseta o formulário
        setNewEndereco({
          logradouro: '', numero: '', complemento: '', bairro: '',
          cidade: '', estado: '', cep: '', apelido: 'Casa'
        });
      } else {
        throw new Error((data && (data.erro || data.error)) || 'Não foi possível salvar o endereço');
      }
    } catch (err) {
      console.error('[PerfilCliente] erro ao salvar endereço', err);
      alert(`Erro ao salvar: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (apelido) => {
    if (apelido === 'Casa') return <FaHome />;
    if (apelido === 'Trabalho') return <FaBriefcase />;
    return <FaMapMarkerAlt />;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h1 className="perfil-headline">Meus Endereços</h1>

        {error && <p className="error-message">Erro: {error}</p>}

        <button
          className="perfil-add-btn"
          onClick={() => setShowForm(!showForm)}
          disabled={isLoading}
        >
          <FaPlus /> {showForm ? 'Cancelar' : 'Adicionar Novo Endereço'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="perfil-form">
            
            {/* 📍 NOVO CAMPO: Autocomplete do Google Maps */}
            <div className="form-group-autocomplete">
                <label>Procurar e Selecionar Endereço:</label>
                <AutocompleteEndereco 
                    onPlaceSelected={handlePlaceSelected} 
                />
                <small>Busque o endereço acima para preencher os campos abaixo automaticamente.</small>
            </div>
            
            {/* Campos que serão preenchidos (e podem ser ajustados pelo usuário) */}
            <div className="form-grid">
              <input
                name="logradouro" value={newEndereco.logradouro} onChange={handleInputChange}
                placeholder="Logradouro (Ex: Rua das Flores)" className="auth-input grid-span-2" required
              />
              <input
                name="numero" value={newEndereco.numero} onChange={handleInputChange}
                placeholder="Nº" className="auth-input" required
              />
              <input
                name="complemento" value={newEndereco.complemento} onChange={handleInputChange}
                placeholder="Complemento (opcional)" className="auth-input"
              />
              <input
                name="bairro" value={newEndereco.bairro} onChange={handleInputChange}
                placeholder="Bairro" className="auth-input" required
              />
              <input
                name="cidade" value={newEndereco.cidade} onChange={handleInputChange}
                placeholder="Cidade" className="auth-input" required
              />
              <input
                name="estado" value={newEndereco.estado} onChange={handleInputChange}
                placeholder="UF" className="auth-input" maxLength="2" required
              />
              <input
                name="cep" value={newEndereco.cep} onChange={handleInputChange}
                placeholder="CEP (ex: 12345-678)" className="auth-input" required
              />
            </div>

            {/* Apelido Group - Sem alteração */}
            <div className="apelido-group">
              <label>Apelido:</label>
              <button
                type="button"
                className={`apelido-btn ${newEndereco.apelido === 'Casa' ? 'active' : ''}`}
                onClick={() => setNewEndereco(prev => ({...prev, apelido: 'Casa'}))}
              >
                <FaHome /> Casa
              </button>
              <button
                type="button"
                className={`apelido-btn ${newEndereco.apelido === 'Trabalho' ? 'active' : ''}`}
                onClick={() => setNewEndereco(prev => ({...prev, apelido: 'Trabalho'}))}
              >
                <FaBriefcase /> Trabalho
              </button>
              <input
                type="text"
                name="apelido"
                value={newEndereco.apelido}
                onChange={handleInputChange}
                placeholder="Outro"
                className="auth-input apelido-input"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Endereço'}
            </button>
          </form>
        )}

        <div className="endereco-list">
          {isLoading && enderecos.length === 0 && <p>Carregando endereços...</p>}
          {!isLoading && enderecos.length === 0 && !showForm && (
            <p>Nenhum endereço cadastrado.</p>
          )}

          {enderecos.map(endereco => (
            <div key={endereco.id} className="endereco-item">
              <div className="endereco-icon">
                {getIcon(endereco.apelido)}
              </div>
              <div className="endereco-details">
                <strong>{endereco.apelido || 'Endereço'}</strong>
                <p>{`${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`}</p>
                <p>{`${endereco.cidade}, ${endereco.estado ? endereco.estado.toUpperCase() : ''} - CEP: ${endereco.cep}`}</p>
                {endereco.complemento && <p>{endereco.complemento}</p>}
              </div>
              <button
                className="endereco-delete-btn"
                onClick={() => handleDelete(endereco.id)}
                aria-label="Excluir endereço"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}