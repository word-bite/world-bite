import React, { useState } from "react";
import "./empresas.css";

export default function CadastroPrato() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState(null);
  const [pratos, setPratos] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome || !descricao || !preco) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    setPratos([...pratos, { nome, descricao, preco, imagem }]);
    setNome("");
    setDescricao("");
    setPreco("");
    setImagem(null);
  };

  return (
    <div className="page-bg">
      <div className="page-card">
        <h1 className="page-headline">Cadastrar Prato</h1>
        <form className="page-form" onSubmit={handleSubmit}>
          <label>
            Nome do Prato:
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Feijoada"
            />
          </label>
          <label>
            Descrição:
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do prato"
            />
          </label>
          <label>
            Preço:
            <input
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 39.90"
            />
          </label>
          <label>
            Imagem:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
            />
          </label>
          <button type="submit" className="page-btn">Cadastrar</button>
        </form>

        {pratos.length > 0 && (
          <div className="pratos-lista">
            <h2>Pratos cadastrados</h2>
            <ul>
              {pratos.map((p, index) => (
                <li key={index}>
                  <strong>{p.nome}</strong> - R$ {p.preco}
                  <p>{p.descricao}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
