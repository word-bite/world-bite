World-Bite (React + Vite)

Landing page estilo Ifood feita em React usando Vite como bundler, com HMR (Hot Module Replacement) e ESLint configurado.

Pré-requisitos

Antes de começar, certifique-se de ter instalado:

Node.js >= 18 (recomendado)

npm >= 9 ou yarn >= 3

1. Instalar dependências

No diretório do projeto, execute:

npm install
# ou, se usar yarn
yarn


Isso instalará todas as dependências listadas no package.json.

2. Rodar o projeto em modo de desenvolvimento

Para iniciar o servidor de desenvolvimento com HMR:

npm run dev
# ou
yarn dev


O terminal exibirá algo como:

Local: http://localhost:5173/
Network: use --host to expose


Abra seu navegador no link fornecido (http://localhost:5173/) para ver a aplicação.

Qualquer alteração nos arquivos será refletida automaticamente no navegador.

3. Build para produção

Para gerar os arquivos finais otimizados para deploy:

npm run build
# ou
yarn build


Os arquivos serão criados na pasta dist/.

Para testar a build localmente:

npm run preview
# ou
yarn preview

4. Plugins e ESLint

O projeto vem com ESLint pré-configurado e pode usar um dos dois plugins React:

@vitejs/plugin-react → usa Babel para Fast Refresh.

@vitejs/plugin-react-swc → usa SWC para Fast Refresh (mais rápido).

Para projetos de produção, recomenda-se usar TypeScript com typescript-eslint para regras mais completas.

5. Estrutura do projeto
src/
  ├─ App.jsx       # Componente principal
  ├─ App.css       # Estilos principais
  └─ main.jsx      # Ponto de entrada React + Vite
public/
  └─ index.html    # HTML base
package.json       # Scripts e dependências

6. Scripts úteis
Comando	Descrição
npm run dev	Roda o projeto em modo de desenvolvimento
npm run build	Cria a versão de produção
npm run preview	Testa a versão de produção localmente
npm run lint	Roda o ESLint para verificar erros de código
7. Recursos extras

React 18

Vite para bundling rápido

HMR (Hot Module Replacement) para desenvolvimento ágil

Paleta de cores: bege, verde escuro, marrom

Fonts sugeridas: Poppins para textos, Pacifico para títulos

Se quiser, posso criar uma versão ainda mais amigável do README, incluindo como trocar o plugin Babel/SWC, dicas de responsividade e personalização do tema de cores para o seu projeto de comida.# World-Bite
