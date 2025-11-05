# 🌍 World Bite - Workflow de Branches

## 📋 Estrutura de Branches

### `main` - Produção (Vercel) 🚀
- **Deploy automático**: Qualquer push na `main` faz deploy no Vercel
- **Configuração**: `src/config/api.js` usa `window.location.origin` (Vercel URL)
- **Banco de dados**: Prisma Accelerate (remoto)
- **URL**: https://world-bite.vercel.app

### `dev` - Desenvolvimento (Localhost) 💻
- **Para desenvolvimento local**: Use esta branch no dia a dia
- **Configuração**: `src/config/api.js` sempre usa `http://localhost:3000`
- **Banco de dados**: PostgreSQL local ou Prisma Accelerate
- **Servidores**: Frontend (5173) + Backend (3000)

## 🔄 Workflow Recomendado

### 1. Desenvolvimento Diário (Branch `dev`)

```bash
# Certifique-se de estar na dev
git checkout dev

# Atualize com o repositório remoto
git pull origin dev

# Inicie os servidores locais
cd backend && node server.js &  # Backend porta 3000
cd .. && npm run dev            # Frontend porta 5173

# Faça suas alterações...
# Teste localmente em http://localhost:5173

# Commit suas mudanças
git add .
git commit -m "feat: sua funcionalidade"
git push origin dev
```

### 2. Deploy para Produção (Branch `main`)

Quando suas funcionalidades estiverem prontas e testadas:

```bash
# Vá para a main
git checkout main

# Atualize a main
git pull origin main

# Faça merge da dev (ou crie Pull Request no GitHub)
git merge dev

# Resolva conflitos se houver
# Teste se necessário

# Push para produção (dispara deploy no Vercel)
git push origin main
```

### 3. Criar Nova Funcionalidade (Feature Branch)

```bash
# Crie uma branch a partir da dev
git checkout dev
git checkout -b feature/nome-da-funcionalidade

# Desenvolva...
git add .
git commit -m "feat: descrição"

# Push da feature
git push origin feature/nome-da-funcionalidade

# Depois, faça merge para dev
git checkout dev
git merge feature/nome-da-funcionalidade
git push origin dev
```

## ⚙️ Configuração Local

### Backend (`/backend`)
```env
# Use localhost para dev
DATABASE_URL="postgresql://user@localhost:5432/worldbite?schema=public"

# Ou use Prisma Accelerate (remoto)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

### Frontend (`src/config/api.js`)
- **Branch `dev`**: Sempre `http://localhost:3000`
- **Branch `main`**: Detecta ambiente automaticamente

## 🚨 Regras Importantes

1. **NUNCA faça push direto na `main`** sem testar na `dev` primeiro
2. **Sempre trabalhe na `dev`** para desenvolvimento local
3. **Use feature branches** para funcionalidades grandes
4. **Teste localmente** antes de fazer merge para `main`
5. **Mantenha `dev` e `main` sincronizadas** regularmente

## 🔍 Verificar em Qual Branch Você Está

```bash
git branch  # Mostra todas as branches (* indica a atual)
```

## 📝 Comandos Úteis

```bash
# Ver diferenças entre dev e main
git diff dev..main

# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline --graph --all

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Descartar alterações locais
git checkout -- arquivo.js
```

## 🐛 Troubleshooting

### "API não responde" no localhost
- Certifique-se de estar na branch `dev`
- Verifique se o backend está rodando na porta 3000
- Confira `src/config/api.js` está configurado para localhost

### Conflitos no merge
```bash
# Ver arquivos com conflito
git status

# Aceitar versão da dev
git checkout --ours arquivo.js

# Aceitar versão da main
git checkout --theirs arquivo.js

# Depois de resolver
git add .
git commit
```

### Backend não conecta ao banco
- Branch `dev`: Use banco local ou URL do Prisma
- Branch `main`: Certifique-se que variáveis estão no Vercel

## 📚 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Prisma Cloud**: https://cloud.prisma.io/
- **GitHub Repo**: https://github.com/word-bite/world-bite
- **Docs de Deploy**: Ver `DEPLOY_VERCEL.md`

---

**Dica**: Configure seu terminal para mostrar a branch atual no prompt! Isso evita commits na branch errada.
