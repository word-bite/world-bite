import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CadastroRestaurante.css";
import "../loginPage/login.css"; // Para os estilos da logo

export default function CadastroRestaurante() {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    descricao: "",
    endereco: "",
    telefone_contato: "",
    email_contato: "",
    pais_id: "",
    horario_abertura: "",
    horario_fechamento: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Remover caracteres não numéricos do CNPJ antes de enviar
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '');

    try {
      const response = await fetch("http://localhost:3000/restaurantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviar os dados do formulário com o CNPJ já limpo
        body: JSON.stringify({ ...formData, cnpj: cnpjLimpo }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar restaurante. Verifique os dados.");
      }

      const novoRestaurante = await response.json();
      console.log("Restaurante cadastrado com sucesso!", novoRestaurante);
      alert("Restaurante cadastrado com sucesso!");
      
      // Limpar o formulário após o sucesso
      setFormData({
        nome: "",
        cnpj: "",
        descricao: "",
        endereco: "",
        telefone_contato: "",
        email_contato: "",
        pais_id: "",
        horario_abertura: "",
        horario_fechamento: "",
      });

    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
    }
  };

  return (
    <>
      <Link to="/" className="logo-top-left">
        <img src="/logoNome.jpeg" alt="World Bite Logo" />
      </Link>
      <div className="cadastro-bg">
      <div className="cadastro-center-container">
        <div className="cadastro-card">
          <h1 className="cadastro-headline">Cadastrar Restaurante</h1>
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <label>
              Nome do Restaurante
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Sabor do Mundo" required />
            </label>
            <label>
              CNPJ
              <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="99.999.999/0001-99" required />
            </label>
            <label>
              Descrição
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Ex: Restaurante especializado em comida italiana..." />
            </label>
            <label>
              Endereço
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, número, bairro, cidade" required />
            </label>
            <label>
              Telefone de Contato
              <input type="tel" name="telefone_contato" value={formData.telefone_contato} onChange={handleChange} placeholder="(99) 99999-9999" />
            </label>
            <label>
              E-mail de Contato
              <input type="email" name="email_contato" value={formData.email_contato} onChange={handleChange} placeholder="contato@exemplo.com" />
            </label>
            <label>
              País
              <select name="pais_id" value={formData.pais_id} onChange={handleChange} required>
                <option value="">Selecione um país</option>
                <option value="Brasil">Brasil</option>
                <option value="China">China</option>
                <option value="Rússia">Rússia</option>
                <option value="Itália">Itália</option>
                <option value="França">França</option>
                <option value="Espanha">Espanha</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="México">México</option>
                <option value="Japão">Japão</option>
                <option value="Índia">Índia</option>
              </select>
            </label>
            <label>
              Horário de Abertura
              <input type="time" name="horario_abertura" value={formData.horario_abertura} onChange={handleChange} />
            </label>
            <label>
              Horário de Fechamento
              <input type="time" name="horario_fechamento" value={formData.horario_fechamento} onChange={handleChange} />
            </label>
            <button type="submit" className="cadastro-btn">
              Cadastrar
            </button>
          </form>
          <Link
            to="/login"
            className="cadastro-btn"
            style={{ width: "150px", textAlign: "center", marginTop: 16, background: "#e0f7e9", color: "#234236" }}
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}