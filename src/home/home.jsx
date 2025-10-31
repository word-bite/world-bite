import React, { useState, useRef } from "react";
import "./home.css";
import EnderecoModal from "./endereco/enderecoModal";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [enderecos, setEnderecos] = useState([]);

  // Definir título da página para debug
  React.useEffect(() => {
    document.title = "🏠 Home - World Bite";
  }, []);

  // Refs para as seções
  const carreiraRef = useRef(null);
  const sobreRef = useRef(null);
  const empresasRef = useRef(null);

  // Função para scroll suave
  const scrollToSection = ref => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Header de Debug */}
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: '#6f42c1', 
        color: 'white', 
        padding: '5px 10px', 
        fontSize: '12px', 
        zIndex: 9999,
        textAlign: 'center'
      }}>
        🏠 PÁGINA HOME - URL: {window.location.pathname}
      </div>
      
      <div className="home-bg" style={{ marginTop: '30px' }}>
      <EnderecoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddEndereco={endereco => setEnderecos([...enderecos, endereco])}
      />
      <header className="home-header">
        <img src="/logoNome.jpeg" alt="World Bite Logo" className="home-logo" />
        <nav className="home-nav">
          <a href="#" onClick={e => { e.preventDefault(); setModalOpen(true); }}>Endereços</a>
          {enderecos.map((end, idx) => (
            <span key={idx} style={{ marginLeft: 12, color: "#234236", fontWeight: 500 }}>
              {end}
            </span>
          ))}
          <a href="#">Carreiras</a>
          <a href="#">Sobre</a>
          <a href="/tela-empresa">Para Empresas</a>
        </nav>
        <div className="home-actions">
          <a href="/cadastro-usuario" className="home-link">criar conta</a>
          <a href="/login"><button className="home-btn">Entrar</button></a>
        </div>
      </header>
      <main className="home-main">
        <h1 className="home-title">Venha Provar o Mundo</h1>
        <p className="home-subtitle">
          O que você precisa está aqui. Peça e receba onde estiver.
        </p>
        <div className="home-search">
          <input type="text" placeholder="Endereço de entrega e número" />
          <button className="home-btn-search">Buscar</button>
        </div>
        <div style={{ margin: "24px 0", width: "100%", maxWidth: 400 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 8, color: "black"}}>Endereços atuais:</h3>
          <ul>
            {enderecos.length > 0 ? (
              enderecos.map((end, idx) => (
                <li key={idx} style={{ marginBottom: 6, color: "#234236" }}>
                  {end.formatted_address || end}
                </li>
              ))
            ) : (
              <li style={{ color: "#999" }}>Nenhum endereço cadastrado.</li>
            )}
          </ul>
        </div>
        <div className="home-cards">
          <div className="home-card restaurante">
            <h2>Restaurante</h2>
            <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80" alt="Restaurante" />
            <button className="home-btn-card">Ver opções &nbsp; &gt;</button>
          </div>
          <div className="home-card coquetelaria">
            <h2>Coquetelaria</h2>
            <img src="https://zanzemos.com/wp-content/uploads/bfi_thumb/Bebidas-tipicas-kobby-mendez-xBFTjrMIC0c-unsplash-oq5nphth2idjuwyjjliqr5gt91x37071vamc6n3nlo.jpg" alt="Coquetelaria" />
            <button className="home-btn-card">Buscar Bares &nbsp; &gt;</button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}