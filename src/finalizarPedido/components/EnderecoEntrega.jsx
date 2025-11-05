import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import AutocompleteEndereco from "../../AutocompleteEndereco";
import "./EnderecoEntrega.css";

export default function EnderecoEntrega({ onEnderecoChange, onEnderecoSelecionado }) {
  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [mostrarNovoEndereco, setMostrarNovoEndereco] = useState(false);
  const [endereco, setEndereco] = useState({
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: "",
    cep: ""
  });
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  useEffect(() => {
    carregarEnderecos();
  }, []);

  useEffect(() => {
    if (onEnderecoChange && endereco.logradouro && endereco.numero) {
      onEnderecoChange(endereco);
    }
  }, [endereco, onEnderecoChange]);

  const carregarEnderecos = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMostrarNovoEndereco(true);
        setCarregando(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/usuarios/enderecos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.sucesso) {
        setEnderecosSalvos(data.enderecos || []);
        if (data.enderecos && data.enderecos.length > 0) {
          selecionarEndereco(data.enderecos[0]);
        } else {
          setMostrarNovoEndereco(true);
        }
      } else {
        setMostrarNovoEndereco(true);
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      setMostrarNovoEndereco(true);
    } finally {
      setCarregando(false);
    }
  };

  const selecionarEndereco = (end) => {
    setEnderecoSelecionado(end);
    setEndereco({
      logradouro: end.logradouro,
      bairro: end.bairro,
      cidade: end.cidade,
      estado: end.estado,
      numero: end.numero,
      complemento: end.complemento || "",
      cep: end.cep
    });
    setMostrarNovoEndereco(false);
    
    if (onEnderecoSelecionado) {
      onEnderecoSelecionado(end);
    }
  };

  const handlePlaceSelected = (addressData) => {
    setEndereco(prev => ({
      ...prev,
      ...addressData
    }));
    setEnderecoSelecionado(null);
  };

  const handleChange = (e) => {
    const novoEndereco = { ...endereco, [e.target.name]: e.target.value };
    setEndereco(novoEndereco);
  };

  const buscarCep = async (cep) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Atualiza o CEP no estado
    setEndereco(prev => ({ ...prev, cep: cep }));
    setErroCep('');

    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);
    console.log(`🔍 Buscando CEP: ${cepLimpo}`);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErroCep('❌ CEP não encontrado');
        console.error('CEP não encontrado');
        return;
      }

      console.log('✅ CEP encontrado:', data);

      // Preenche os campos automaticamente
      setEndereco(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
        cep: cep
      }));

      setErroCep('✅ CEP encontrado! Endereço preenchido automaticamente.');

      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setErroCep(''), 3000);

    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error);
      setErroCep('❌ Erro ao buscar CEP. Tente novamente.');
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e) => {
    const cep = e.target.value;
    buscarCep(cep);
  };

  return (
    <div className="endereco-form">
      <h2>Endereço de Entrega</h2>

      {carregando && (
        <div className="loading-container">
          <p className="loading">⏳ Carregando endereços salvos...</p>
        </div>
      )}

      {!carregando && enderecosSalvos.length > 0 && (
        <div className="enderecos-salvos">
          <label>Selecione um endereço salvo:</label>
          <div className="enderecos-lista-select">
            {enderecosSalvos.map((end) => (
              <div
                key={end.id}
                className={`endereco-card ${enderecoSelecionado?.id === end.id ? 'selecionado' : ''}`}
                onClick={() => selecionarEndereco(end)}
              >
                <div className="endereco-radio">
                  <input
                    type="radio"
                    name="endereco"
                    checked={enderecoSelecionado?.id === end.id}
                    onChange={() => {}}
                  />
                </div>
                <div className="endereco-dados">
                  {end.apelido && <strong>{end.apelido}</strong>}
                  <p>{end.logradouro}, {end.numero}</p>
                  <p className="endereco-detalhes-small">
                    {end.bairro}, {end.cidade} - {end.estado}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            className="btn-novo-endereco"
            onClick={() => {
              setMostrarNovoEndereco(!mostrarNovoEndereco);
              setEnderecoSelecionado(null);
            }}
          >
            {mostrarNovoEndereco ? '❌ Cancelar' : '➕ Usar outro endereço'}
          </button>
        </div>
      )}

      {!carregando && enderecosSalvos.length === 0 && !mostrarNovoEndereco && (
        <div className="sem-enderecos">
          <p>📍 Você ainda não tem endereços salvos.</p>
          <button
            type="button"
            className="btn-novo-endereco"
            onClick={() => setMostrarNovoEndereco(true)}
          >
            ➕ Cadastrar novo endereço
          </button>
        </div>
      )}

      {!carregando && (mostrarNovoEndereco || enderecosSalvos.length === 0) && (
        <div className="novo-endereco-form">
          <label>CEP *</label>
          <input
            type="text"
            name="cep"
            value={endereco.cep}
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

          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <>
              <AutocompleteEndereco onPlaceSelected={handlePlaceSelected} />
              <div style={{marginBottom: '20px'}}></div>
            </>
          )}

          <label>Logradouro *</label>
          <input
            type="text"
            name="logradouro"
            value={endereco.logradouro}
            onChange={handleChange}
            placeholder="Rua, Avenida, etc"
          />

          <div className="form-row">
            <div>
              <label>Número *</label>
              <input
                type="text"
                name="numero"
                value={endereco.numero}
                onChange={handleChange}
                placeholder="123"
                required
              />
            </div>
            <div>
              <label>Complemento</label>
              <input
                type="text"
                name="complemento"
                value={endereco.complemento}
                onChange={handleChange}
                placeholder="Apto, Bloco"
              />
            </div>
          </div>

          <label>Bairro *</label>
          <input
            type="text"
            name="bairro"
            value={endereco.bairro}
            onChange={handleChange}
            placeholder="Bairro"
            required
          />

          <div className="form-row">
            <div>
              <label>Cidade *</label>
              <input
                type="text"
                name="cidade"
                value={endereco.cidade}
                onChange={handleChange}
                placeholder="Cidade"
                required
              />
            </div>
            <div>
              <label>Estado *</label>
              <input
                type="text"
                name="estado"
                value={endereco.estado}
                onChange={handleChange}
                placeholder="SP"
                maxLength="2"
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
