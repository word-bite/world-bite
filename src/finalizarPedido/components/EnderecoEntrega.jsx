import React, { useState } from "react";
import "./EnderecoEntrega.css";

export default function EnderecoEntrega() {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: ""
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Função: Buscar na API ViaCEP
  const buscarCep = async (value) => {
    const cepLimpo = value.replace(/\D/g, "");
    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
          setErro("CEP não encontrado.");
          setCarregando(false);
          return;
        }

        setEndereco((prev) => ({
          ...prev,
          rua: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf
        }));
      } catch (e) {
        setErro("Erro ao buscar CEP.");
      }

      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    setEndereco({ ...endereco, [e.target.name]: e.target.value });
  };

  return (
    <div className="endereco-form">
      <h2>Endereço de Entrega</h2>

      {/* Campo CEP */}
      <label>CEP</label>
      <input
        type="text"
        value={cep}
        maxLength={8}
        onChange={(e) => buscarCep(e.target.value)}
        placeholder="Digite o CEP"
      />

      {carregando && <p className="loading">Buscando CEP...</p>}
      {erro && <p className="erro">{erro}</p>}

      {/* Rua */}
      <label>Rua</label>
      <input
        type="text"
        name="rua"
        value={endereco.rua}
        onChange={handleChange}
        placeholder="Rua"
        disabled
      />

      {/* Bairro */}
      <label>Bairro</label>
      <input
        type="text"
        name="bairro"
        value={endereco.bairro}
        onChange={handleChange}
        placeholder="Bairro"
        disabled
      />

      {/* Cidade */}
      <label>Cidade</label>
      <input
        type="text"
        name="cidade"
        value={endereco.cidade}
        onChange={handleChange}
        placeholder="Cidade"
        disabled
      />

      {/* Estado */}
      <label>Estado</label>
      <input
        type="text"
        name="estado"
        value={endereco.estado}
        onChange={handleChange}
        placeholder="Estado"
        disabled
      />

      {/* Número */}
      <label>Número</label>
      <input
        type="text"
        name="numero"
        value={endereco.numero}
        onChange={handleChange}
        placeholder="Número"
      />

      {/* Complemento */}
      <label>Complemento</label>
      <input
        type="text"
        name="complemento"
        value={endereco.complemento}
        onChange={handleChange}
        placeholder="Complemento"
      />

      <button className="salvar-btn">
        Salvar Endereço
      </button>
    </div>
  );
}
