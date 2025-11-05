# World-Bite 🍽️

Plataforma completa para restaurantes com sistema de autenticação sem senha, usando códigos de verificação por email e SMS.

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|--------|------------|-----------|
| **Frontend** | React + Vite | Interface do usuário moderna e responsiva |
| **Backend** | Node.js (Express) | API RESTful com sistema CRUD completo |
| **Banco de Dados** | PostgreSQL + Prisma | Gerenciamento de dados com ORM moderno |
| **Autenticação** | Vonage (SMS) + Nodemailer (Email) | Verificação por código sem senha |
| **Validação** | Joi | Validação robusta de dados de entrada |

## 📋 Funcionalidades

### 🏢 Sistema de Restaurantes
- ✅ CRUD completo de restaurantes
- ✅ Verificação por SMS via Vonage
- ✅ Validação de CNPJ e dados

### 👥 Sistema de Usuários  
- ✅ Cadastro de usuários sem senha
- ✅ Login com código de verificação (Email/SMS)
- ✅ **Login com Facebook (OAuth 2.0)**
- ✅ CRUD completo de usuários
- ✅ Verificação por email (Nodemailer)
- ✅ Verificação por SMS (Vonage)


## ⚙️ Requisitos do Sistema

Certifique-se de ter os seguintes softwares instalados:

- **Node.js**: Versão >= 18.0 (Recomendado: 20.19+)
- **npm**: Gerenciador de pacotes do Node.js
- **PostgreSQL**: Servidor PostgreSQL em execução
- **Conta Vonage**: Para envio de SMS ([vonage.com](https://vonage.com))
- **Servidor SMTP**: Para envio de emails (Gmail, Outlook, etc.)

🚀 Como Iniciar o Projeto Localmente
Siga os passos abaixo para configurar e rodar o backend e o frontend.

1. Clonagem e Navegação
Abra o terminal e clone o repositório principal

2. Configuração do Backend (API)
Acesse a pasta backend, instale as dependências e configure o acesso à API e ao banco de dados.

cd backend
npm install

Crie um arquivo chamado .env na pasta backend e preencha com suas credenciais:

# Configurações do Banco de Dados
DATABASE_URL="postgresql://[USUARIO]:[SENHA]@[HOST]:[PORTA]/[NOME_DO_BANCO]?schema=public"

# Configurações da API de SMS (Vonage)
VONAGE_API_KEY="SUA_CHAVE_DE_API"
VONAGE_API_SECRET="SEU_API_SECRET"

# Configurações de Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seu.email@gmail.com"
EMAIL_PASS="sua_senha_de_app"

# Configurações Facebook OAuth
FACEBOOK_APP_ID="sua_app_id_facebook"
FACEBOOK_APP_SECRET="seu_app_secret_facebook"


3. Setup do Banco de Dados com Prisma
Aplique as migrações do Prisma para criar o schema necessário no PostgreSQL:

```bash
# Primeira migração (restaurantes)
npx prisma migrate dev --name init_restaurante

# Segunda migração (usuários)
npx prisma migrate dev --name add_usuarios

# Gerar o cliente Prisma
npx prisma generate
```

4. Configuração do Frontend (Web App)
Volte para a pasta raiz do projeto (world-bite) e acesse o diretório do frontend para instalar as dependências:

cd ../front-end
npm install


5. Execução do Projeto
Abra dois terminais separados:

| Terminal | Localização | Comando | Ação |
|----------|-------------|---------|------|
| **Terminal 1** | `/backend` | `npm start` ou `node server.js` | Inicia a API REST na porta 3000 |
| **Terminal 2** | `/` (raiz) | `npm run dev` | Inicia o frontend na porta 5173 |

📱 **Acesse a aplicação**: http://localhost:5173

## 📡 APIs Disponíveis

### 🏢 APIs de Restaurantes
```
POST /restaurantes          - Criar restaurante
GET /restaurantes           - Listar restaurantes  
GET /restaurantes/:id       - Buscar por ID
PUT /restaurantes/:id       - Atualizar restaurante
DELETE /restaurantes/:id    - Deletar restaurante
POST /send-sms             - Enviar código SMS
```

### 👥 APIs de Usuários
```
POST /api/usuarios/cadastro     - Cadastrar usuário
POST /api/usuarios/codigo-email - Enviar código por email
POST /api/usuarios/codigo-sms   - Enviar código por SMS  
POST /api/usuarios/login        - Login com código
GET /api/usuarios              - Listar usuários
GET /api/usuarios/:id          - Buscar usuário por ID
PUT /api/usuarios/:id          - Atualizar usuário
DELETE /api/usuarios/:id       - Deletar usuário
```

### 📱 APIs de Facebook Login
```
GET /api/auth/facebook/url           - Obter URL de login Facebook
POST /api/auth/facebook/callback     - Processar código de retorno
POST /api/auth/facebook/token        - Login direto com access token
```

## 🧪 Testando as APIs

### Cadastro de Usuário
```bash
curl -X POST http://localhost:3000/api/usuarios/cadastro \
-H "Content-Type: application/json" \
-d '{
  "nome": "João Silva",
  "email": "joao@email.com", 
  "telefone": "+5511999888777"
}'
```

### Solicitar Código por Email
```bash
curl -X POST http://localhost:3000/api/usuarios/codigo-email \
-H "Content-Type: application/json" \
-d '{"email": "joao@email.com"}'
```

### Login com Código
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
-H "Content-Type: application/json" \
-d '{
  "email": "joao@email.com",
  "codigo": "123456"
}'
```

### 🔑 Login com Facebook (OAuth 2.0)

#### 1. Obter URL de Login
```bash
curl "http://localhost:3000/api/auth/facebook/url?redirect_uri=http://localhost:5173/auth/facebook/callback"
```

#### 2. Processar Callback (Frontend → Backend)
```bash
curl -X POST http://localhost:3000/api/auth/facebook/callback \
-H "Content-Type: application/json" \
-d '{
  "code": "codigo_do_facebook",
  "redirect_uri": "http://localhost:5173/auth/facebook/callback"
}'
```

#### 3. Login Direto com Token
```bash
curl -X POST http://localhost:3000/api/auth/facebook/token \
-H "Content-Type: application/json" \
-d '{
  "access_token": "token_do_facebook"
}'
```

## 💳 Testando Pagamentos (Mercado Pago)

### Cartões de Teste

Use estes cartões para testar diferentes cenários de pagamento:

| Bandeira | Número do Cartão | Código de Segurança | Validade |
|----------|------------------|---------------------|----------|
| **Mastercard** | 5031 4332 1540 6351 | 123 | 11/30 |
| **Visa** | 4235 6477 2802 5682 | 123 | 11/30 |
| **American Express** | 3753 651535 56885 | 1234 | 11/30 |
| **Elo Débito** | 5067 7667 8388 8311 | 123 | 11/30 |

### Status de Pagamento

Para testar diferentes resultados de pagamento, insira o **status desejado no nome do titular do cartão**:

| Nome do Titular | Status | Resultado | CPF para Teste |
|----------------|--------|-----------|----------------|
| **APRO** | Aprovado | ✅ Pagamento aprovado com sucesso | 12345678909 |
| **OTHE** | Recusado | ❌ Recusado por erro geral | 12345678909 |

### Exemplo de Teste Completo

```
💳 Dados do Cartão:
  - Número: 5031 4332 1540 6351
  - Titular: APRO
  - Validade: 11/30
  - CVV: 123
  - CPF: 123.456.789-09
  
✅ Resultado Esperado: Pagamento Aprovado
```

### 📝 Observações Importantes

- Os cartões de teste **não realizam cobranças reais**
- Use sempre o **CPF 12345678909** para testes
- O nome do titular define o status do pagamento
- Testes disponíveis apenas em **ambiente sandbox**
- Para produção, configure as credenciais reais do Mercado Pago no `.env`

## 🔑 Como funciona o Login com Facebook (fluxo OAuth 2.0)

### **Frontend → Facebook**
1. O usuário clica em "Continuar com Facebook"
2. Frontend redireciona para `https://facebook.com/dialog/oauth` com:
   - `client_id`: ID da sua app Facebook
   - `redirect_uri`: URL de retorno (ex: `/auth/facebook/callback`)
   - `scope`: Permissões (`email,public_profile`)

### **Facebook → Frontend**
3. Usuário autoriza no Facebook
4. Facebook redireciona de volta com `authorization code`

### **Frontend → Backend**
5. Frontend envia código para `/api/auth/facebook/callback`

### **Backend → Facebook**
6. Backend troca código por `access_token` na API do Facebook
7. Backend busca dados do usuário (`/me?fields=id,name,email,picture`)

### **Backend → Banco de Dados**
8. Se usuário existe (por `facebook_id` ou `email`): autentica
9. Se não existe: cria novo usuário
10. Gera JWT token

### **Backend → Frontend**
11. Retorna JWT e dados do usuário
12. Frontend salva token e redireciona para app

### 📱 **Configuração Facebook App**

1. **Criar App Facebook**: https://developers.facebook.com
2. **Configurar OAuth**:
   - Valid OAuth Redirect URIs: `http://localhost:5173/auth/facebook/callback`
   - App Domains: `localhost`
3. **Obter credenciais**:
   - App ID → `FACEBOOK_APP_ID`
   - App Secret → `FACEBOOK_APP_SECRET`

## 🔧 Comandos Úteis

```bash
# Visualizar banco de dados
npx prisma studio

# Reset do banco (cuidado!)
npx prisma migrate reset

# Ver status das migrações
npx prisma migrate status

# Iniciar o servidor
cd backend && node server.js
```

## ⚠️ Resolução de Problemas

### ❌ Erro: "Cannot read properties of undefined (reading 'findUnique')"
**Causa:** PostgreSQL não está rodando na porta 5432.

**Soluções:**

**🔧 Solução 1: Instalar PostgreSQL**
```bash
# 1. Baixar PostgreSQL: https://postgresql.org
# 2. Instalar e iniciar o serviço
# 3. Criar banco de dados:
createdb worldbite

# 4. Configurar .env com suas credenciais:
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/worldbite"

# 5. Executar migrações:
cd backend
npx prisma migrate dev --name init_restaurante
npx prisma migrate dev --name add_usuarios
npx prisma generate

# 6. Iniciar servidor:
npm start
```

**🎓 Solução 2: Usar Docker (Mais Fácil)**
```bash
# 1. Instalar Docker Desktop
# 2. Criar PostgreSQL em container:
docker run --name worldbite-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=worldbite -p 5432:5432 -d postgres:13

# 3. Configurar .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/worldbite"

# 4. Seguir passos 5-6 da Solução 1
```

**⚡ Solução 3: Servidor Sem Banco (Mais Fácil para Testes)**
```bash
# Use o servidor que funciona SEM PostgreSQL:
cd backend
node server-sem-banco.js

# Teste a API:
curl -X POST http://localhost:3000/api/usuarios/cadastro \
-H "Content-Type: application/json" \
-d '{"nome": "João Silva", "email": "joao@exemplo.com"}'

# Ver status:
curl http://localhost:3000/api/status
```

**📋 Resumo das Soluções:**
- **Para produção**: Use Solução 1 (PostgreSQL) ou 2 (Docker)
- **Para testes/acadêmico**: Use Solução 3 (server-sem-banco.js)
- **Demonstração rápida**: Solução 3 funciona imediatamente

### Verificar se o servidor está rodando
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac  
lsof -i :3000
```

## 📚 Estrutura do Projeto

```
world-bite/
├── backend/                         # 🖥️ Servidor Backend (Node.js + Express)
│   ├── .env                         # Variáveis de ambiente
│   ├── server.js                    # Servidor principal (com PostgreSQL)
│   ├── server-sem-banco.js          # Servidor acadêmico (sem banco)
│   ├── package.json                 # Dependências do backend
│   ├── config/                      # ⚙️ Configurações
│   │   ├── database.js              # Configuração Prisma
│   │   ├── logger.js                # Sistema de logs
│   │   ├── redis.js                 # Configuração Redis
│   │   └── vonage.js                # Configuração SMS
│   ├── middlewares/                 # 🛡️ Middlewares
│   │   └── authMiddleware.js        # Middleware de autenticação
│   ├── routes/                      # 🛤️ Rotas da API
│   │   ├── authRoutes.js            # Rotas de autenticação
│   │   └── pratos.js                # Rotas de pratos/cardápio
│   ├── services/                    # 🔧 Serviços de negócio
│   │   ├── authService.js           # Lógica de autenticação
│   │   ├── emailService.js          # Envio de emails
│   │   ├── facebookService.js       # Integração Facebook
│   │   ├── usuarioService.js        # Serviços de usuário
│   │   └── verificationService.js   # Verificação de código
│   └── prisma/                      # 🗄️ ORM e Banco de Dados
│       ├── schema.prisma            # Schema do banco
│       └── migrations/              # Migrações do banco
│           ├── migration_lock.toml
│           ├── 20250916094036_init_restaurante/
│           └── 20250930035340_criar_tabela_pratos/
├── src/                             # ⚛️ Frontend React
│   ├── App.jsx                      # Componente principal
│   ├── App.css                      # Estilos globais
│   ├── main.jsx                     # Ponto de entrada React + Vite
│   ├── index.css                    # Estilos base
│   ├── assets/                      # 🖼️ Recursos estáticos
│   │   └── react.svg                # Logo React
│   ├── components/                  # 🧩 Componentes reutilizáveis
│   │   ├── PrivateRoute.jsx         # Rota privada
│   │   └── FacebookLogin/           # Componente login Facebook
│   │       ├── FacebookLogin.jsx
│   │       └── FacebookLogin.css
│   ├── home/                        # 🏠 Página inicial
│   │   ├── home.jsx
│   │   ├── home.css
│   │   └── endereco/                # Modal de endereço
│   │       ├── enderecoModal.jsx
│   │       └── enderecoModal.css
│   ├── loginPage/                   # 🔐 Páginas de login
│   │   ├── login.jsx
│   │   ├── login.css
│   │   ├── FacebookLoginButton.jsx
│   │   └── LoginPageWithFacebook.jsx
│   ├── loginpagerestaurante/        # 🏢 Login restaurante
│   │   ├── LoginPageRestaurante.jsx
│   │   └── LoginPageRestaurante.css
│   ├── cadastroRestaurante/         # 📝 Cadastro restaurante
│   │   ├── CadastroRestaurante.jsx
│   │   └── CadastroRestaurante.css
│   ├── empresas/                    # 🏪 Gestão empresarial
│   │   ├── empresas.css
│   │   ├── CadastroPrato.jsx        # Cadastro de pratos
│   │   ├── CadastroRestaurante.jsx  # Cadastro restaurante
│   │   ├── GerenciarCardapio.jsx    # Gestão do cardápio
│   │   └── PainelRestaurante.jsx    # Painel administrativo
│   ├── pageCliente/                 # 👤 Área do cliente
│   │   ├── pageCliente.jsx
│   │   ├── pageCliente.css
│   │   ├── index.tsx
│   │   └── notFound.tsx
│   ├── pedidos/                     # 🛒 Sistema de pedidos
│   │   ├── pedidos.jsx
│   │   └── pedidos.css
│   ├── TelaEmpresa/                 # 🏢 Tela da empresa
│   │   ├── TelaEmpresa.jsx
│   │   └── TelaEmpresa.css
│   ├── pages/                       # 📄 Páginas especiais
│   │   └── FacebookCallback.jsx     # Callback Facebook OAuth
│   └── examples/                    # 📚 Exemplos
│       └── FacebookLoginExample.jsx
├── public/                          # 🌐 Arquivos públicos
│   ├── index.html                   # HTML base
│   ├── vite.svg                     # Logo Vite
│   ├── logo.png                     # Logo do projeto
│   └── logoNome.jpeg                # Logo com nome
├── package.json                     # 📦 Dependências frontend
├── vite.config.js                   # ⚡ Configuração Vite
├── eslint.config.js                 # 🔍 Configuração ESLint
└── README.md                        # 📖 Esta documentação
```