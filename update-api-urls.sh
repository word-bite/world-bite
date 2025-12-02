#!/bin/bash

# Lista de arquivos para atualizar (exceto os já atualizados)
files=(
  "src/finalizarPedido/finalizarPedido.jsx"
  "src/finalizarPedido/components/MetodoPagamento.jsx"
  "src/finalizarPedido/components/EnderecoEntrega.jsx"
  "src/loginPage/FacebookLoginButton.jsx"
  "src/cadastroRestaurante/CadastroRestaurante.jsx"
  "src/empresas/AceitarRecusarPedidos.jsx"
  "src/empresas/GerenciarCardapio.jsx"
  "src/empresas/PainelChamadas.jsx"
  "src/empresas/CadastroPrato.jsx"
  "src/pageCliente/perfilCliente.jsx"
  "src/pageCliente/GerenciarPerfil.jsx"
  "src/loginpagerestaurante/LoginPageRestaurante.jsx"
)

# Substituir todas as ocorrências de localhost:3000 por API_BASE_URL
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Atualizando: $file"
    # Substituir fetch('http://localhost:3000 por fetch(\`\${API_BASE_URL}
    sed -i '' "s|fetch('http://localhost:3000|fetch(\`\${API_BASE_URL}|g" "$file"
    # Substituir fetch("http://localhost:3000 por fetch(\`\${API_BASE_URL}
    sed -i '' 's|fetch("http://localhost:3000|fetch(`${API_BASE_URL}|g' "$file"
    # Substituir fetch(\`http://localhost:3000 por fetch(\`\${API_BASE_URL}
    sed -i '' 's|fetch(`http://localhost:3000|fetch(`${API_BASE_URL}|g' "$file"
  fi
done

echo "✅ Atualização concluída!"
