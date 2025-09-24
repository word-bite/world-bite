World-Bite
Landing page e sistema de autenticação para restaurantes.

🛠️ Tecnologias Utilizadas
Camada	Tecnologia	Descrição
Frontend	React + Vite	Interface do usuário e lógica de apresentação.
Backend	Node.js (Express)	API RESTful e lógica de negócios.
Banco de Dados	PostgreSQL	Gerenciamento de dados persistente.
ORM	Prisma	Cliente ORM para comunicação segura com o PostgreSQL.
Autenticação	Vonage (SMS API)	Serviço de envio de código de verificação por SMS.

Exportar para as Planilhas
⚙️ Requisitos do Sistema
Certifique-se de ter os seguintes softwares instalados e em execução na sua máquina antes de iniciar:

Node.js: Versão >= 20.19 (Recomendado)

npm: Gerenciador de pacotes do Node.js

PostgreSQL: Um servidor PostgreSQL deve estar em execução e acessível.

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


3. Setup do Banco de Dados com Prisma
Aplique as migrações do Prisma para criar o schema necessário no PostgreSQL:

npx prisma migrate dev --name init

4. Configuração do Frontend (Web App)
Volte para a pasta raiz do projeto (world-bite) e acesse o diretório do frontend para instalar as dependências:

cd ../front-end
npm install


5. Execução do Projeto
Abra dois terminais separados.

Terminal	Comando	Ação
Terminal 1 (/backend)	npm start	Inicia a API REST na porta 3000.
Terminal 2 (/front-end)	npm run dev	Inicia o servidor web.

Exportar para as Planilhas
Acesse http://localhost:5173 no seu navegador para visualizar a aplicação.



