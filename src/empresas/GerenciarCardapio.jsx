import React, { useState, useEffect } from "react";
import "./empresas.css"; 
// Você pode precisar importar estilos de modal se não estiverem no empresas.css
// import './Modal.css'; 

// As categorias devem ser as mesmas definidas no schema.prisma
const CATEGORIAS = ["PRINCIPAL", "SOBREMESA", "ENTRADA", "BEBIDA", "PROMOCAO"];

const API_BASE_URL = 'http://localhost:3000/api/restaurante/prato';

// 🔑 Função utilitária para obter o cabeçalho de autenticação
const getCnpjHeader = () => {
    const cnpj = localStorage.getItem('restauranteLogado');
    if (!cnpj) {
        throw new Error("Usuário não autenticado. CNPJ não encontrado.");
    }
    return { 'Authorization': `CNPJ ${cnpj}` };
};

// 💡 Função utilitária para formatar o preço para exibição
const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


export default function GerenciarCardapio() {
    const [pratos, setPratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para o Modal de Edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pratoEmEdicao, setPratoEmEdicao] = useState(null);

    // 🔑 READ: Função para CARREGAR os pratos do restaurante logado
    const fetchPratos = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = getCnpjHeader();
            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers, // Adiciona o header de autenticação
                },
            });

            if (!response.ok) {
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

    // 🔑 DELETE: Função para Excluir um Prato
    const handleDelete = async (pratoId) => {
        if (!window.confirm("Tem certeza que deseja excluir este prato? Esta ação é irreversível.")) {
            return;
        }

        try {
            const headers = getCnpjHeader();
            
            const response = await fetch(`${API_BASE_URL}/${pratoId}`, {
                method: 'DELETE',
                headers: { ...headers },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Falha ao excluir prato.');
            }

            // Se o DELETE foi bem-sucedido, atualiza a lista de pratos
            await fetchPratos();
            alert("Prato excluído com sucesso!");

        } catch (err) {
            alert(`Erro na exclusão: ${err.message}`);
            console.error("Erro na exclusão:", err);
        }
    };

    // 🔑 UPDATE: Função para Abrir o Modal de Edição
    const handleEditClick = (prato) => {
        // Clonamos o prato para que a edição no modal não afete o estado principal antes de salvar
        setPratoEmEdicao({ 
            ...prato,
            // Converte o preço para string para o input funcionar corretamente
            preco: String(prato.preco),
            // Garante que o checkbox funcione
            disponivel: prato.disponivel 
        }); 
        setIsModalOpen(true);
    };

    // 🔑 UPDATE: Função para Enviar a Edição (PUT)
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        const { id, nome, descricao, preco, categoria, urlImagem, disponivel } = pratoEmEdicao;

        if (!nome || !descricao || !preco || !categoria) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        try {
            const headers = getCnpjHeader();
            
            const pratoAtualizadoData = {
                nome,
                descricao,
                preco: parseFloat(preco), 
                categoria,
                urlImagem,
                disponivel
            };

            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: JSON.stringify(pratoAtualizadoData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Falha ao atualizar prato.');
            }

            // Recarrega a lista, fecha o modal e limpa o estado de edição
            await fetchPratos();
            setIsModalOpen(false);
            setPratoEmEdicao(null);
            alert("Prato atualizado com sucesso!");

        } catch (err) {
            alert(`Erro na atualização: ${err.message}`);
            console.error("Erro na atualização:", err);
        }
    };


    useEffect(() => {
        fetchPratos();
    }, []);


    // --- Renderização do Modal de Edição ---
    const renderEditModal = () => {
        if (!isModalOpen || !pratoEmEdicao) return null;

        const handlePriceChange = (e) => {
            const value = e.target.value.replace(',', '.');
            setPratoEmEdicao(prev => ({ ...prev, preco: value }));
        };

        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setPratoEmEdicao(prev => ({ 
                ...prev, 
                [name]: type === 'checkbox' ? checked : value 
            }));
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Editar Prato: {pratoEmEdicao.nome}</h3>
                    <form onSubmit={handleUpdateSubmit} className="page-form">
                        
                        <label>Nome:</label>
                        <input
                            type="text"
                            name="nome"
                            value={pratoEmEdicao.nome}
                            onChange={handleChange}
                            required
                        />

                        <label>Descrição:</label>
                        <textarea
                            name="descricao"
                            value={pratoEmEdicao.descricao}
                            onChange={handleChange}
                            required
                        />
                        
                        <label>Preço (R$):</label>
                        <input
                            type="text"
                            name="preco"
                            value={pratoEmEdicao.preco}
                            onChange={handlePriceChange}
                            required
                        />
                        
                        <label>Categoria:</label>
                        <select
                            name="categoria"
                            value={pratoEmEdicao.categoria}
                            onChange={handleChange}
                            required
                        >
                            {CATEGORIAS.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <label>URL da Imagem:</label>
                        <input
                            type="text"
                            name="urlImagem"
                            value={pratoEmEdicao.urlImagem || ''}
                            onChange={handleChange}
                        />

                        <label className="checkbox-label">
                            Disponível:
                            <input
                                type="checkbox"
                                name="disponivel"
                                checked={pratoEmEdicao.disponivel}
                                onChange={handleChange}
                            />
                        </label>
                        
                        <div className="modal-actions">
                            <button type="submit" className="page-btn">Salvar Alterações</button>
                            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    return (
        <div className="page-bg">
            <div className="page-card">
                <h1 className="page-headline">Gerenciar Cardápio</h1>
                <p>Aqui você pode ver, editar e excluir os pratos cadastrados.</p>

                <div className="pratos-lista">
                    <h2>Pratos Cadastrados ({pratos.length})</h2>
                    {loading && <p>Carregando pratos...</p>}
                    {error && <p className="error-message">Erro ao carregar: {error}</p>}
                    
                    {!loading && pratos.length === 0 && (
                        <p>Nenhum prato cadastrado ainda. Use a tela de Cadastro de Pratos para começar!</p>
                    )}

                    {!loading && pratos.length > 0 && (
                        <ul className="list-group">
                            {pratos.map((p) => (
                                <li key={p.id} className="prato-item list-item">
                                    <div className="prato-info">
                                        <strong>{p.nome}</strong> - {formatPrice(p.preco)}
                                        <span className={`disponibilidade ${p.disponivel ? 'disponivel' : 'indisponivel'}`}>
                                            {p.disponivel ? 'Disponível' : 'Indisponível'}
                                        </span>
                                        <p className="prato-description">{p.descricao}</p>
                                        <small>Categoria: {p.categoria}</small>
                                    </div>
                                    <div className="prato-actions">
                                        <button 
                                            className="action-btn edit-btn" 
                                            onClick={() => handleEditClick(p)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {renderEditModal()}
        </div>
    );
}