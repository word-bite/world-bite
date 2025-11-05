import os
import re

files = [
    "src/cadastroRestaurante/CadastroRestaurante.jsx",
    "src/empresas/AceitarRecusarPedidos.jsx",
    "src/empresas/CadastroPrato.jsx",
    "src/empresas/GerenciarCardapio.jsx",
    "src/empresas/PainelChamadas.jsx",
    "src/finalizarPedido/components/EnderecoEntrega.jsx",
    "src/finalizarPedido/finalizarPedido.jsx",
    "src/loginPage/FacebookLoginButton.jsx",
    "src/loginpagerestaurante/LoginPageRestaurante.jsx",
    "src/pageCliente/perfilCliente.jsx",
    "src/pageCliente/GerenciarPerfil.jsx",
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Verificar se já tem o import
    if 'import { API_BASE_URL }' in content or 'import {API_BASE_URL}' in content:
        print(f"✅ {filepath} já tem o import")
        continue
    
    # Calcular o caminho relativo correto
    depth = filepath.count('/') - 1  # src/ conta como 1
    if 'components/' in filepath or 'pages/' in filepath:
        relative_path = '../' * (depth - 1) + 'config/api'
    else:
        relative_path = '../' * (depth - 1) + 'config/api'
    
    # Adicionar o import após o primeiro import React
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'import React' in line:
            lines.insert(i + 1, f'import {{ API_BASE_URL }} from "{relative_path}";')
            break
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    
    print(f"✨ {filepath} atualizado com import")

print("\n✅ Todos os arquivos atualizados!")
