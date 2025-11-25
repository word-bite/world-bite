import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./TelaEmpresa.css";

// 🔑 Função utilitária para formatar o CNPJ (Movida para fora da função principal)
const formatCnpj = (cnpj) => {
    // Aplica a máscara: XX.XXX.XXX/YYYY-ZZ
    const cleaned = ('' + cnpj).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
    }
    return cnpj; // Retorna o original se não conseguir formatar
};

export default function TelaEmpresa() {
    const navigate = useNavigate();
    
    // LER OS DADOS DO LOCAL STORAGE
    const nomeRestaurante = localStorage.getItem('restauranteNome');
    const cnpjRestaurante = localStorage.getItem('restauranteCnpj');

    const handleLogout = () => {
        // Limpa todos os itens de sessão do restaurante
        localStorage.removeItem('restauranteLogado'); 
        localStorage.removeItem('restauranteNome'); 
        localStorage.removeItem('restauranteCnpj');
        localStorage.removeItem('tokenRestaurante');
        
        navigate('/login-restaurante'); 
    };

    return (
        <div className="tela-empresa-bg">
            <div className="tela-empresa-container">
                
                {/* PAINEL DE INFORMAÇÕES DO RESTAURANTE */}
                <div className="restaurante-info-panel">
                    <h2 className="restaurante-nome-logado">
                        Bem-vindo(a), {nomeRestaurante || 'Restaurante'}! 
                    </h2>
                    <p className="restaurante-cnpj-logado">
                        CNPJ: {cnpjRestaurante ? formatCnpj(cnpjRestaurante) : 'Não disponível'}
                    </p>
                </div>
                
                <h1 className="tela-empresa-headline">Área da Empresa</h1>
                <p className="tela-empresa-subtitle">
                    Escolha uma opção para continuar
                </p>
                
                <div className="tela-empresa-opcoes">
                
                    {/* Botão de Painel do Restaurante (Pode ser removido se não tiver funcionalidade) */}
                    <Link to="/painel-restaurante">
                        <button className="tela-empresa-btn">Painel do Restaurante</button>
                    </Link>
                    
                    <Link to="/cadastro-prato">
                        <button className="tela-empresa-btn">Cadastrar Pratos</button>
                    </Link>
                    
                    {/* 🚀 NOVO BOTÃO: GERENCIAR CARDÁPIO */}
                    <Link to="/gerenciar-cardapio">
                        <button className="tela-empresa-btn">Gerenciar Cardápio (CRUD)</button>
                    </Link>

                </div>
                
                <button 
                    onClick={handleLogout} 
                    className="tela-empresa-btn"
                    style={{ 
                        backgroundColor: '#dc3545',
                        marginTop: '30px' 
                    }}
                >
                    Sair / Logout
                </button>

            </div>
        </div>
    );
}