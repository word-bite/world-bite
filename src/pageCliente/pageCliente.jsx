import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pageCliente.css";

const categories = [
  {
    id: "brasileira",
    name: "Cozinha Brasileira 🇧🇷",
    description: "Feita com carinho, sabores que abraçam.",
    image:
      "https://www.melhoresdestinos.com.br/wp-content/uploads/2020/12/comidas-tipicas-capa2019-01.jpg",
    restaurants: [
      {
        id: "sabor-da-casa",
        name: "Sabor da Casa",
        rating: 4.8,
        time: "30-40 min",
        distance: "1.2 km",
        priceRange: "$$",
        hero:
          "https://terrabrasilrestaurante.com.br/wp-content/uploads/2019/01/Restaurante-Choperia-Terra-Brasil-3.jpg",
        highlight: "Promoção de PF executivo hoje",
        dishes: [
          {
            id: "pf-carne",
            name: "Bife Acebolado",
            description: "Arroz soltinho, feijão caldoso, bife acebolado e salada.",
            price: 32.9,
            image:
              "https://controlenamao.com.br/blog/wp-content/uploads/2025/02/Como-Montar-um-Restaurante-Prato-Feito-PF_-Guia-em-10-passos.webp",
            tags: ["Popular", "Feito na hora"],
          },
          {
            id: "feijoada",
            name: "Feijoada Completa",
            description: "Servida com arroz, farofa, couve refogada e laranja.",
            price: 45.0,
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh04q8NeAdGAiQ8XTDcR7HNSRqNjfLKJa7VQ&s",
            tags: ["Família", "Tradicional"],
          },
          {
            id: "strogonoff",
            name: "Strogonoff de Frango",
            description: "Creme leve com champignon, acompanha arroz e batata palha.",
            price: 36.5,
            image:
              "https://receitadaboa.com.br/wp-content/uploads/2024/04/iStock-1460067431.jpg",
            tags: ["Cremoso", "Favorito"],
          },
        ],
      },
      {
        id: "Bahianinho-pf",
        name: "Bahianinho",
        rating: 4.6,
        time: "25-35 min",
        distance: "2.0 km",
        priceRange: "$$",
        hero:
          "https://static.wixstatic.com/media/954288_4990fcc2c8a74c82a0d75a309bfb3bc8~mv2.jpg/v1/fill/w_776,h_436,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/954288_4990fcc2c8a74c82a0d75a309bfb3bc8~mv2.jpg",
        highlight: "Hoje tem caipirinha dobrada",
        dishes: [
          {
            id: "carne-de-panela",
            name: "Carne de Panela",
            description: "Cozida lentamente, acompanha purê de mandioca.",
            price: 38.0,
            image:
              "https://img.cybercook.com.br/publicidades/receita-carne-de-panela.jpeg",
            tags: ["Caseiro", "Suculento"],
          },
          {
            id: "moqueca",
            name: "Moqueca Baiana",
            description: "Peixe fresco, leite de coco e dendê, acompanha arroz.",
            price: 49.9,
            image:
              "https://www.estadao.com.br/resizer/v2/TFCR7BBZKNPUFNQHCMSMELCLHI.jpg?quality=80&auth=362db4f87d39715256c1a909f08568a8a7b9d3dd1cfebce214e7b6046f2123da&width=720&height=410&focal=0,0",
            tags: ["Fresco", "Levemente picante"],
          },
        ],
      },
    ],
  },
  {
    id: "massas",
    name: "Massas Italianas 🇮🇹",
    description: "Pasta fresca e molhos apaixonantes.",
    image:
      "https://gastronomiacarioca.zonasul.com.br/wp-content/uploads/2023/05/destaque_massa_italiana_tomate_zona_sul_ilustrativo.jpg",
    restaurants: [
      {
        id: "cantina-nona",
        name: "Cantina da Nona",
        rating: 4.9,
        time: "35-45 min",
        distance: "1.8 km",
        priceRange: "$$$",
        hero:
          "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/38/c9/c6/recinto-do-restaurante.jpg?w=900&h=-1&s=1",
        highlight: "Massa fresca feita ao vivo",
        dishes: [
          {
            id: "ravioli-trufado",
            name: "Ravioli Trufado",
            description: "Recheado com ricota e cogumelos, finalizado com manteiga trufada.",
            price: 64.0,
            image:
              "https://cdn11.bigcommerce.com/s-cjh14ahqln/product_images/uploaded_images/cheese-ravioli-2-web.jpg",
            tags: ["Chef", "Artesanal"],
          },
          {
            id: "lasanha",
            name: "Lasanha Bolonhesa",
            description: "Massa de espinafre, molho bolonhesa e queijo gratinado.",
            price: 58.0,
            image:
              "https://anamariareceitas.com.br/wp-content/uploads/2022/10/Lasanha-a-bolonhesa.jpg",
            tags: ["Reconfortante", "Clássico"],
          },
        ],
      },
      {
        id: "trattoria-di-casa",
        name: "Trattoria di Casa",
        rating: 4.7,
        time: "30-40 min",
        distance: "2.5 km",
        priceRange: "$$",
        hero:
          "https://restaurantepiccini.com/assets/images/varanda-1920x1200.jpg",
        highlight: "Menu degustação especial",
        dishes: [
          {
            id: "gnocchi-pesto",
            name: "Nhoque ao Pesto",
            description: "Manjericão fresco, nozes e parmesão maturado.",
            price: 44.5,
            image:
              "https://images.unsplash.com/photo-1481931715705-36f1f1b1fd4d?auto=format&fit=crop&w=900&q=80",
            tags: ["Vegetariano", "Leve"],
          },
          {
            id: "fettuccine-fungi",
            name: "Fettuccine Funghi",
            description: "Molho de cogumelos selvagens e um toque de vinho branco.",
            price: 47.0,
            image:
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
            tags: ["Aveludado", "Chef"],
          },
        ],
      },
    ],
  },
  {
    id: "saudavel",
    name: "Opções Vegetarianas 🥗",
    description: "Receitas fresh com ingredientes orgânicos.",
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
    restaurants: [
      {
        id: "recanto-verde",
        name: "Recanto Verde",
        rating: 4.8,
        time: "20-30 min",
        distance: "1.5 km",
        priceRange: "$$",
        hero:
          "https://simonde.com.br/wp-content/uploads/2019/11/restaurante-teva-vegetal-vegano-vegetariano-organico-sao-paulo-pinheiros-1200-3-1024x683.jpg.webp",
        highlight: "Sucos prensados a frio",
        dishes: [
          {
            id: "omelete-queijo",
            name: "Omelete de Queijo",
            description: "Omelete de com queijo e molho de tomate orgânico.",
            price: 34.9,
            image:
              "https://img.cybercook.com.br/receitas/105/omelete-classica-1.jpeg",
            tags: ["Veggie", "Rápido"],
          },
          {
            id: "wrap-integral",
            name: "Wrap Integral",
            description: "Frango orgânico, mix de folhas, creme de castanhas.",
            price: 29.5,
            image:
              "https://s2-casaejardim.glbimg.com/nog6RrZOCF074ZNWKcCqmQNd4_w=/0x0:1400x1074/924x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_a0b7e59562ef42049f4e191fe476fe7d/internal_photos/bs/2024/D/a/fSNhyQT8K4Ta5HHg3VVg/receita-wrap-frango-guacamole-green-joy.jpg",
            tags: ["Proteico", "Refrescante"],
          },
        ],
      },
      {
        id: "flora-cafe",
        name: "Flora Café",
        rating: 4.5,
        time: "25-35 min",
        distance: "2.9 km",
        priceRange: "$$",
        hero:
          "https://destinopoa.com.br/wp-content/uploads/2024/03/MG_9055-1.jpg",
        highlight: "Menu sazonal com ingredientes locais",
        dishes: [
          {
            id: "salada-citrus",
            name: "Salada Citrus",
            description: "Folhas baby, laranja bahia, noz pecã e vinagrete de mel.",
            price: 28.0,
            image:
              "https://www.receiteria.com.br/wp-content/uploads/salada-tropical-com-molho-de-laranja-1.jpg",
            tags: ["Fresca", "Sem glúten"],
          },
          {
            id: "creme-abobora",
            name: "Creme de Abóbora",
            description: "Finalizado com sementes tostadas e azeite aromatizado.",
            price: 26.5,
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGpsGmdYoHz2OA7IowKbgNQ6bxVQlRRR79g&s",
            tags: ["Conforto", "Vegano"],
          },
        ],
      },
    ],
  },
  {
    id: "doces",
    name: "Doces Franceses 🇫🇷",
    description: "Sobremesas que derretem o coração.",
    image:
      "https://img.freepik.com/fotos-gratis/sobremesa-mexicana-de-alto-angulo-na-mesa_23-2149517097.jpg",
    restaurants: [
      {
        id: "atelier-doce",
        name: "Ateliê Doce",
        rating: 4.9,
        time: "25-35 min",
        distance: "1.0 km",
        priceRange: "$$$",
        hero:
          "https://irp.cdn-website.com/33406c6e/dms3rep/multi/doces+de+confeitaria.jpg",
        highlight: "Sobremesa autoral da semana",
        dishes: [
          {
            id: "torta-amendoa",
            name: "Torta de Amêndoas",
            description: "Massa amanteigada, creme pâtissier e mel de florada silvestre.",
            price: 33.0,
            image:
              "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/1BB2E24D-5CF9-4342-A6BE-23872BFA53FD/Derivates/dcecb19260eacc6936175ea048935ea5d89085eb.jpg",
            tags: ["Crocante", "Autor"],
          },
          {
            id: "cheesecake-cupuacu",
            name: "Cheesecake de Cupuaçu",
            description: "Base de castanha-do-pará e cobertura de fruta fresca.",
            price: 36.0,
            image:
              "https://anamariareceitas.com.br/wp-content/uploads/2022/10/Cheesecake-de-Cupuacu.jpg",
            tags: ["Amazônico", "Equilibrado"],
          },
        ],
      },
      {
        id: "Le cafe gourmand",
        name: "Le Café Gourmand",
        rating: 4.7,
        time: "20-30 min",
        distance: "1.7 km",
        priceRange: "$$",
        hero:
          "https://wanderlust-journal.com/wp-content/uploads/2023/03/les_deux_magots_25_september_2019.jpg",
        highlight: "Linha assinatura com chocolates belgas",
        dishes: [
          {
            id: "bomba-chocolate",
            name: "Bomba de Chocolate",
            description: "Trufado com cacau 70% e pistache caramelizado.",
            price: 5.5,
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtVNhJh8u7TbXAvh9X3xe5M5c2ROwZYk4GjQ&s",
            tags: ["Unitário", "Intenso"],
          },
          {
            id: "brownie-castanhas",
            name: "Brownie de Castanhas",
            description: "Crocante por fora, macio por dentro, servido com calda quente.",
            price: 18.5,
            image:
              "https://cptstatic.s3.amazonaws.com/imagens/enviadas/materias/materia25890/brownie-de-chocolate-com-castanha-do-para-receitas-cursos-cpt.jpg",
            tags: ["Compartilhar", "Chocolate"],
          },
        ],
      },
    ],
  },
];

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const normalize = (value) => value.normalize("NFD").replace(/[^\w\s]/g, "") || "";

export default function PageCliente() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    categories[0].restaurants[0].id,
  );
  const [bagItems, setBagItems] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const normalizedTerm = normalize(searchTerm.toLowerCase());

  const filteredCategories = useMemo(() => {
    if (!normalizedTerm) {
      return categories;
    }

    return categories
      .map((category) => {
        const matchesCategory = normalize(category.name.toLowerCase()).includes(
          normalizedTerm,
        );

        const filteredRestaurants = category.restaurants
          .map((restaurant) => {
            const matchesRestaurant = normalize(
              restaurant.name.toLowerCase(),
            ).includes(normalizedTerm);

            const filteredDishes = restaurant.dishes.filter((dish) =>
              normalize(dish.name.toLowerCase()).includes(normalizedTerm),
            );

            if (matchesRestaurant || filteredDishes.length > 0) {
              return {
                ...restaurant,
                dishes: filteredDishes.length > 0 ? filteredDishes : restaurant.dishes,
              };
            }
            return matchesCategory
              ? { ...restaurant }
              : null;
          })
          .filter(Boolean);

        if (matchesCategory || filteredRestaurants.length > 0) {
          return {
            ...category,
            restaurants: matchesCategory ? category.restaurants : filteredRestaurants,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [normalizedTerm]);

  const activeCategory = useMemo(() => {
    const fallbackCategory = filteredCategories[0] ?? categories[0];
    return (
      filteredCategories.find((category) => category.id === selectedCategoryId) ??
      fallbackCategory
    );
  }, [filteredCategories, selectedCategoryId]);

  const activeRestaurant = useMemo(() => {
    if (!activeCategory) return null;
    const fallbackRestaurant = activeCategory.restaurants[0] ?? null;
    return (
      activeCategory.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ??
      fallbackRestaurant
    );
  }, [activeCategory, selectedRestaurantId]);

  const searchResults = useMemo(() => {
    if (!normalizedTerm) return [];
    return categories.flatMap((category) =>
      category.restaurants.flatMap((restaurant) =>
        restaurant.dishes
          .filter((dish) => normalize(dish.name.toLowerCase()).includes(normalizedTerm))
          .map((dish) => ({
            dish,
            restaurant,
            category,
          })),
      ),
    );
  }, [normalizedTerm]);

  useEffect(() => {
    if (!activeCategory) {
      setSelectedCategoryId(categories[0].id);
      return;
    }
    if (!activeCategory.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId)) {
      const firstRestaurant = activeCategory.restaurants[0];
      if (firstRestaurant) {
        setSelectedRestaurantId(firstRestaurant.id);
      }
    }
  }, [activeCategory, selectedRestaurantId]);

  const subtotal = useMemo(
    () => bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [bagItems],
  );
  const deliveryFee = bagItems.length > 0 ? 8.9 : 0;
  const total = subtotal + deliveryFee;

  const updateQuantity = (itemId, delta) => {
    setBagItems((current) => {
      const next = current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0);
      return next;
    });
  };

  const addToBag = (dish, restaurant) => {
    setBagItems((current) => {
      const existing = current.find((item) => item.id === dish.id);
      if (existing) {
        return current.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
            : item,
        );
      }
      return [
        ...current,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          restaurant: restaurant.name,
          quantity: 1,
        },
      ];
    });
  };

  const highlightedCategoryId = activeCategory?.id;

  return (
    <div className="cliente-app">
      <header className="cliente-header">
        <button
          type="button"
          aria-label="Abrir navegação"
          className="nav-trigger"
          onClick={() => setIsNavOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="header-brand">
          <span className="brand-mark">WB</span>
          <div className="brand-text">
            <strong>Sabores de Todos os Lugares</strong>
            <small>delivery cultural</small>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="address-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
            <span>Entregar em Casa</span>
          </button>
          <div className="header-avatar">VG</div>
        </div>
      </header>

      <div className={`cliente-nav-drawer${isNavOpen ? " open" : ""}`}>
        <div className="drawer-content">
          <div className="drawer-header">
            <div>
              <p className="drawer-greeting">Olá, Vitório</p>
              <p className="drawer-sub">Pronto para escolher o próximo sabor?</p>
            </div>
            <button
              type="button"
              aria-label="Fechar navegação"
              className="drawer-close"
              onClick={() => setIsNavOpen(false)}
            >

            </button>
          </div>
          <nav className="drawer-nav">
            <button type="button" className="drawer-link active">
              Restaurantes
            </button>
            <a href="/pedidos"> <button type="button" className="drawer-link">
              Acompanhar pedido
            </button></a> 
            <button type="button" className="drawer-link">
              Gerenciar perfil
            </button>
          </nav>
          <div className="drawer-highlight">
            <p>Você tem 2 cupons disponíveis para hoje.</p>
            <button type="button">Ver cupons</button>
          </div>
        </div>
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Fechar menu"
          onClick={() => setIsNavOpen(false)}
        />
      </div>

      <main className="cliente-main">
        <section className="hero">
          <div>
            <p className="hero-sub">Entregamos agora</p>
            <h1>Seu hub, descubra novos sabores</h1>
            <p className="hero-text">
              Explore categorias com curadoria, descubra novos restaurantes e monte seu pedido
              em minutos.
            </p>
          </div>
          <div className="hero-card">
            <p>Pedido atual</p>
            <strong>{bagItems.length > 0 ? `${bagItems.length} itens` : "Sacola vazia"}</strong>
            <span>{bagItems.length > 0 ? formatCurrency(total) : "Comece adicionando pratos"}</span>
          </div>
        </section>

        <div className="search-bar">
          <label htmlFor="search-input">Buscar por item, categoria ou restaurante</label>
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79L20 21.5 21.5 20l-6-6zM6.5 11a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z" />
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Busque por pratos artesanais, sobremesas, combos..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpar busca">
                Limpar
              </button>
            )}
          </div>
        </div>

        <section className="categories">
          <div className="section-header">
            <h2>Categorias para você</h2>
            <span>{filteredCategories.length} categorias encontradas</span>
          </div>
          <div className="category-grid">
            {filteredCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`category-card${
                  highlightedCategoryId === category.id ? " selected" : ""
                }`}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  const firstRestaurant = category.restaurants[0];
                  if (firstRestaurant) {
                    setSelectedRestaurantId(firstRestaurant.id);
                  }
                }}
              >
                <div className="category-media">
                  <img src={category.image} alt={category.name} loading="lazy" />
                </div>
                <div className="category-info">
                  <div className="badge">Curadoria</div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {searchTerm && searchResults.length > 0 && (
          <section className="search-results">
            <div className="section-header">
              <h2>Resultados para "{searchTerm}"</h2>
              <span>{searchResults.length} pratos encontrados</span>
            </div>
            <div className="result-grid">
              {searchResults.map(({ dish, restaurant, category }) => (
                <article key={dish.id} className="dish-result">
                  <img src={dish.image} alt={dish.name} loading="lazy" />
                  <div>
                    <div className="result-labels">
                      <span>{category.name}</span>
                      <span>{restaurant.name}</span>
                    </div>
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                    <footer>
                      <strong>{formatCurrency(dish.price)}</strong>
                      <button type="button" onClick={() => addToBag(dish, restaurant)}>
                        Adicionar
                      </button>
                    </footer>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeCategory && (
          <section className="restaurant-showcase">
            <div className="section-header">
              <h2>{activeCategory.name}</h2>
              <span>Selecione um restaurante para ver o cardápio</span>
            </div>
            <div className="restaurant-scroll">
              {activeCategory.restaurants.map((restaurant) => (
                <button
                  type="button"
                  key={restaurant.id}
                  className={`restaurant-card${
                    activeRestaurant?.id === restaurant.id ? " active" : ""
                  }`}
                  onClick={() => setSelectedRestaurantId(restaurant.id)}
                >
                  <div className="restaurant-hero">
                    <img src={restaurant.hero} alt={restaurant.name} loading="lazy" />
                    <span className="restaurant-highlight">{restaurant.highlight}</span>
                  </div>
                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <div className="restaurant-meta">
                      <span>⭐ {restaurant.rating.toFixed(1)}</span>
                      <span>{restaurant.time}</span>
                      <span>{restaurant.distance}</span>
                      <span>{restaurant.priceRange}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeRestaurant && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="menu-category">{activeCategory.name}</span>
                <h2>{activeRestaurant.name}</h2>
                <p>{activeRestaurant.highlight}</p>
              </div>
              <div className="menu-badge">Entrega rápida</div>
            </div>
            <div className="menu-grid">
              {activeRestaurant.dishes.map((dish) => (
                <article key={dish.id} className="dish-card">
                  <div className="dish-content">
                    <div className="dish-tags">
                      {dish.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                    <strong>{formatCurrency(dish.price)}</strong>
                    <button type="button" onClick={() => addToBag(dish, activeRestaurant)}>
                      Adicionar à sacola
                    </button>
                  </div>
                  <div className="dish-media">
                    <img src={dish.image} alt={dish.name} loading="lazy" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <aside className="cliente-bag">
        <div className="bag-header">
          <h2>Sacola</h2>
          <span>{bagItems.length} itens</span>
        </div>
        <div className="bag-body">
          {bagItems.length === 0 ? (
            <div className="bag-empty">
              <h3>Monte sua experiência</h3>
              <p>Adicione pratos e acompanhe os detalhes do pedido por aqui.</p>
            </div>
          ) : (
            <ul>
              {bagItems.map((item) => (
                <li key={item.id}>
                  <div className="bag-item-info">
                    <strong>{item.name}</strong>
                    <span>{item.restaurant}</span>
                  </div>
                  <div className="bag-item-actions">
                    <div className="bag-stepper">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bag-summary">
          <div>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div>
            <span>Entrega</span>
            <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}</span>
          </div>
          <div className="bag-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
        <button type="button" className="bag-button" disabled={bagItems.length === 0} onClick={() => navigate('/finalizar-pedido')}>
          {bagItems.length === 0 ? "Escolha seu prato" : "Escolher forma de pagamento"}
        </button>
      </aside>

      <div className="bag-mobile">
        <button type="button" onClick={() => navigate('/finalizar-pedido')} disabled={bagItems.length === 0}>
          <div>
            <strong>Sacola</strong>
            <span>
              {bagItems.length === 0
                ? "Vazia"
                : `${bagItems.length} itens · ${formatCurrency(total)}`}
            </span>
          </div>
          <span className="bag-mobile-icon">→</span>
        </button>
      </div>
    </div>

  );
}