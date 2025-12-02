import React, { useState, useEffect } from "react";
import "./home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [typingText, setTypingText] = useState("");
  const fullText = "Venha provar o mundo!";

  // Efeito de typing animation
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypingText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Garantir que o scroll funcione
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const restaurantes = [
    {
      id: 1,
      nome: "Pizzaria Bella Italia",
      tipo: "Italiana",
      nota: 4.8,
      tempo: "25-35 min",
      entrega: "R$ 5,00",
      foto: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      nome: "Sushi Express",
      tipo: "Japonesa",
      nota: 4.9,
      tempo: "30-40 min",
      entrega: "R$ 7,00",
      foto: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      nome: "Burger House",
      tipo: "Hamburgeria",
      nota: 4.7,
      tempo: "20-30 min",
      entrega: "R$ 4,00",
      foto: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 4,
      nome: "Taco Loco",
      tipo: "Mexicana",
      nota: 4.6,
      tempo: "35-45 min",
      entrega: "R$ 6,00",
      foto: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 5,
      nome: "Açaí da Praia",
      tipo: "Açaí e Sucos",
      nota: 4.9,
      tempo: "15-25 min",
      entrega: "R$ 3,00",
      foto: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <div className="home-container" style={{ width: '100%', overflow: 'visible', position: 'relative' }}>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/logoNome.jpeg" alt="World Bite Logo" />
          <span>World-Bite</span>
        </div>

        <div className="navbar-actions">
          <a href="/relatorios-plataforma" className="navbar-btn navbar-btn-reports">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="20" x2="12" y2="10"></line>
              <line x1="18" y1="20" x2="18" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
            <span>Relatórios</span>
          </a>

          <a href="/login-restaurante" className="navbar-btn navbar-btn-restaurant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z"></path>
            </svg>
            <span>Restaurante</span>
          </a>
          
          <a href="#entregadores" className="navbar-btn navbar-btn-driver">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Entregador</span>
          </a>

          <a href="/login" className="navbar-btn navbar-btn-login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Entrar</span>
          </a>

          <button className="menu-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <a href="/login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Entrar
            </a>
            <a href="/cadastro-usuario">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Criar conta
            </a>
            <a href="/login-restaurante">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z"></path>
              </svg>
              Sou Restaurante
            </a>
            <a href="#entregadores">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Sou Entregador
            </a>
            <a href="#restaurantes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Restaurantes
            </a>
            <a href="#sobre">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Sobre
            </a>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{typingText}<span className="cursor">|</span></h1>
          <p className="hero-subtitle">Comida boa, entrega rápida e sem complicação</p>
          
          <div className="hero-search">
            <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Digite seu endereço para ver restaurantes perto de você"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="search-btn">Buscar</button>
          </div>
        </div>
      </section>

      {/* RESTAURANTES EM DESTAQUE */}
      <section className="featured-section" id="restaurantes">
        <div className="section-container">
          <h2 className="section-title">Restaurantes em destaque</h2>
          <div className="restaurants-scroll">
            {restaurantes.map(rest => (
              <div key={rest.id} className="restaurant-card">
                <div className="restaurant-image">
                  <img src={rest.foto} alt={rest.nome} />
                  <div className="restaurant-badge">{rest.nota} ⭐</div>
                </div>
                <div className="restaurant-info">
                  <h3>{rest.nome}</h3>
                  <p className="restaurant-type">{rest.tipo}</p>
                  <div className="restaurant-details">
                    <span className="delivery-time">🕒 {rest.tempo}</span>
                    <span className="delivery-price">💰 {rest.entrega}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO RESTAURANTES PARCEIROS */}
      <section className="partners-section" id="parceiros">
        <div className="partners-content">
          <div className="partners-text">
            <h2>Tem um restaurante?<br/>Cadastre-se no World-Bite!</h2>
            <p>Aumente suas vendas e alcance milhares de clientes hoje mesmo. Faça parte da maior plataforma de delivery do Brasil.</p>
            <button onClick={() => window.location.href = '/cadastro-restaurante'} className="cta-btn">Quero ser parceiro</button>
          </div>
          <div className="partners-image">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80" alt="Restaurante parceiro" />
          </div>
        </div>
      </section>

      {/* SEÇÃO ENTREGADORES */}
      <section className="drivers-section" id="entregadores">
        <div className="drivers-content">
          <div className="drivers-image">
            <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80" alt="Entregador" />
          </div>
          <div className="drivers-text">
            <h2>Seja entregador e ganhe<br/>dinheiro com liberdade</h2>
            <p>Horários flexíveis, ganhos semanais e entregas perto de você. Faça seu próprio horário e aumente sua renda.</p>
            <button className="cta-btn-secondary">Quero entregar</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="sobre">
        <div className="footer-content">
          <div className="footer-column">
            <h3>Sobre o World-Bite</h3>
            <a href="#">Quem somos</a>
            <a href="#">Imprensa</a>
            <a href="#">Carreiras</a>
            <a href="#">Blog</a>
          </div>

          <div className="footer-column">
            <h3>Suporte</h3>
            <a href="#ajuda">Central de ajuda</a>
            <a href="#">Perguntas frequentes</a>
            <a href="#">Fale conosco</a>
            <a href="#">Status do pedido</a>
          </div>

          <div className="footer-column">
            <h3>Trabalhe Conosco</h3>
            <a href="/cadastro-restaurante">Seja um parceiro</a>
            <a href="/cadastro-entregador">Seja um entregador</a>
            <a href="#">Vagas</a>
          </div>

          <div className="footer-column">
            <h3>Políticas</h3>
            <a href="#">Termos de uso</a>
            <a href="#">Política de privacidade</a>
            <a href="#">Código de conduta</a>
            <a href="#">LGPD</a>
          </div>

          <div className="footer-column">
            <h3>Redes Sociais</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 World-Bite — Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}