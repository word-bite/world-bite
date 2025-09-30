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
├── backend/
│   ├── server.js                    # Servidor principal (com PostgreSQL)
│   ├── server-usuarios-academico.js # Servidor acadêmico (sem banco)
│   ├── config/
│   │   ├── database.js              # Configuração Prisma
│   │   └── logger.js                # Sistema de logs
│   ├── services/
│   │   ├── authService.js           # Lógica de autenticação
│   │   └── emailService.js          # Envio de emails
│   └── prisma/
│       └── schema.prisma            # Schema do banco
├── src/                             # Frontend React
├── public/                          # Arquivos estáticos
└── README.md                        # Esta documentação
```



