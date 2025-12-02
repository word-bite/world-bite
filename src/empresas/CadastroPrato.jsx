import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import "./empresas.css"; // Assumindo que este CSS existe

// As categorias devem ser as mesmas definidas no schema.prisma
const CATEGORIAS = ["PRINCIPAL", "SOBREMESA", "ENTRADA", "BEBIDA", "PROMOCAO"];

export default function CadastroPrato() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]); // Seleciona a primeira como padrão
  const [urlImagem, setUrlImagem] = useState("");
  const [pratos, setPratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔑 Função para obter o CNPJ do localStorage
  const getCnpjHeader = () => {
    const cnpj = localStorage.getItem('restauranteCnpj');

    if (!cnpj) {
      // O PrivateRoute deve impedir o acesso, mas é uma segurança extra
      throw new Error("Usuário não autenticado. CNPJ não encontrado.");
    }
    // Formato exigido pelo Middleware: "CNPJ 99999999000199"
    return { 'Authorization': `CNPJ ${cnpj}` };
  };

  // 🔑 Função para CARREGAR os pratos do restaurante logado
  const fetchPratos = async () => {
  setLoading(true);
  setError(null);
  try {
    const headers = getCnpjHeader();
    const response = await fetch(`${API_BASE_URL}/api/restaurante/prato`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers, // Adiciona o header de autenticação
      },
    });      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao carregar pratos.');
      }

      const data = await response.json();
      setPratos(data);
    } catch (err) {
      console.error("Erro ao buscar pratos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Carrega os pratos na montagem do componente
  useEffect(() => {
    fetchPratos();
  }, []);


  // 🔑 Função para CADASTRAR um novo prato
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !descricao || !preco || !categoria) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const headers = getCnpjHeader();
      
      const novoPratoData = {
        nome,
      descricao,
      preco: parseFloat(preco), // Garante que o preço seja número
      categoria,
      urlImagem,
    };

    const response = await fetch(`${API_BASE_URL}/api/restaurante/prato`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers, // Adiciona o header de autenticação
      },
      body: JSON.stringify(novoPratoData),
    });      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao cadastrar prato.');
      }

      // Se o cadastro foi um sucesso, atualiza a lista e limpa o formulário
      await fetchPratos(); // Recarrega a lista
      setNome("");
      setDescricao("");
      setPreco("");
      setUrlImagem("");
      // Não limpa a categoria

    } catch (err) {
      alert(`Erro no cadastro: ${err.message}`);
      console.error("Erro no cadastro:", err);
    }
  };

  const handlePriceChange = (e) => {
      // Permite apenas números e um único ponto/vírgula
      const value = e.target.value.replace(',', '.');
      setPreco(value);
  };
  
  // 💡 Função utilitária para formatar o preço para exibição
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }


  return (
    <div className="page-bg">
      <div className="page-card">
        <h1 className="page-headline">Cadastrar Prato</h1>
        <form className="page-form" onSubmit={handleSubmit}>
          {/* Nome */}
          <label>
            Nome do Prato:
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Feijoada"
              required
            />
          </label>
          
          {/* Descrição */}
          <label>
            Descrição:
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição completa do prato"
              required
            />
          </label>
          
          {/* Preço */}
          <label>
            Preço (R$):
            <input
              type="text"
              value={preco}
              onChange={handlePriceChange}
              placeholder="Ex: 39.90"
              required
            />
          </label>

          {/* Categoria (Novo Campo) */}
          <label>
            Categoria:
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            >
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          
          {/* URL da Imagem (Substitui o tipo 'file' para simplificar o envio) */}
          <label>
            URL da Imagem:
            <input
              type="text"
              value={urlImagem}
              onChange={(e) => setUrlImagem(e.target.value)}
              placeholder="Ex: http://link.com/minhafoto.jpg"
            />
          </label>
          
          <button type="submit" className="page-btn">Cadastrar Prato</button>
        </form>

        {/* 🔑 LISTAGEM DOS PRATOS */}
        <div className="pratos-lista">
          <h2>Pratos do Cardápio ({pratos.length})</h2>
          {loading && <p>Carregando pratos...</p>}
          {error && <p className="error-message">Erro ao carregar: {error}</p>}
          
          {!loading && pratos.length === 0 && (
              <p>Nenhum prato cadastrado ainda. Comece a adicionar!</p>
          )}

          {!loading && pratos.length > 0 && (
            <ul>
              {pratos.map((p) => (
                <li key={p.id} className="prato-item">
                  <div className="prato-header">
                    <strong>{p.nome}</strong> - {formatPrice(p.preco)}
                    <span className={`disponibilidade ${p.disponivel ? 'disponivel' : 'indisponivel'}`}>
                        {p.disponivel ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <p>{p.descricao}</p>
                  <small>Categoria: {p.categoria}</small>
                  {/* Botões de Ação seriam adicionados aqui para EDITAR e EXCLUIR */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}