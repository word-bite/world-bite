# Configuração do Deploy no Vercel

## 1. Banco de Dados - Prisma Accelerate (Já Configurado!)

Você já criou o banco de dados no Prisma Accelerate! Use esta URL no Vercel:

```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18ya21tMUZHRVgtVDF4dllFOERKa0giLCJhcGlfa2V5IjoiMDFLOTk5OFMzNzBIMkVKRlhUQTE2TjVSWTgiLCJ0ZW5hbnRfaWQiOiJjOTY2YjQ5Zjc2MjlmZWU3Y2QyODA4ZTI2NzFmZTU5YTA4NmU2ZTdlNTM2M2RiMGFhZWU4ZjUwMTE2M2IxZjMwIiwiaW50ZXJuYWxfc2VjcmV0IjoiOTA1MTM5N2ItNjFhMy00NWFhLWEzYzMtMjgzNmYyZTk1NzBiIn0.taphi58vOnSKd5NADGWlezlF3FwbzMxTTJTH8rRh_wQ"
```

**Você também tem a URL direta (para migrations locais):**
```
DIRECT_DATABASE_URL="postgres://c966b49f7629fee7cd2808e2671fe59a086e6e7e5363db0aaee8f501163b1f30:sk_2kmm1FGEX-T1xvYE8DJkH@db.prisma.io:5432/postgres?sslmode=require"
```

## 2. Configurar Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto "world-bite"
3. Vá em **Settings** → **Environment Variables**
4. Adicione TODAS as variáveis abaixo (uma por vez):

```bash
# Banco de Dados (Prisma Accelerate - com cache e conexão global)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18ya21tMUZHRVgtVDF4dllFOERKa0giLCJhcGlfa2V5IjoiMDFLOTk5OFMzNzBIMkVKRlhUQTE2TjVSWTgiLCJ0ZW5hbnRfaWQiOiJjOTY2YjQ5Zjc2MjlmZWU3Y2QyODA4ZTI2NzFmZTU5YTA4NmU2ZTdlNTM2M2RiMGFhZWU4ZjUwMTE2M2IxZjMwIiwiaW50ZXJuYWxfc2VjcmV0IjoiOTA1MTM5N2ItNjFhMy00NWFhLWEzYzMtMjgzNmYyZTk1NzBiIn0.taphi58vOnSKd5NADGWlezlF3FwbzMxTTJTH8rRh_wQ

# URL direta para migrations (opcional, mas recomendado)
DIRECT_DATABASE_URL=postgres://c966b49f7629fee7cd2808e2671fe59a086e6e7e5363db0aaee8f501163b1f30:sk_2kmm1FGEX-T1xvYE8DJkH@db.prisma.io:5432/postgres?sslmode=require

# Autenticação JWT
JWT_SECRET=4b643baf6d3def2870f5a7ec2878537a688a46733d257ac5ae50d1f8cff0a4853659f8eb751fd7fe08983d00508f29b839468e32712faddb4085a8dd036bf2e9

# Vonage SMS
VONAGE_API_KEY=bfce7397
VONAGE_API_SECRET=6x2jU9FG3GWQtj5f
VONAGE_BRAND_NAME=World Bite

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=worldbite01.impacta@gmail.com
EMAIL_PASS=wcyp sbum lvrh teyc
EMAIL_FROM=World Bite <worldbite01.impacta@gmail.com>
EMAIL_SECURE=false

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDs1x1XXlyIgMkS8D1pi-YV16TLR17ZdZQ

# Mercado Pago (Teste)
MERCADOPAGO_ACCESS_TOKEN_TEST=APP_USR-5566113459359060-110414-c8e0ef18fe8a7cdd9198a2d5a4f87c80-2966162883
MERCADOPAGO_PUBLIC_KEY_TEST=APP_USR-4e46566c-d6bf-4efb-a1e1-f154da29dc96

# Facebook OAuth (configure depois se usar)
FACEBOOK_APP_ID=sua_app_id_facebook
FACEBOOK_APP_SECRET=seu_app_secret_facebook

# URLs da aplicação (ATUALIZE COM SUA URL VERCEL!)
FRONTEND_URL=https://world-bite.vercel.app
BACKEND_URL=https://world-bite.vercel.app
```

⚠️ **IMPORTANTE**: Depois do primeiro deploy, volte e atualize `FRONTEND_URL` e `BACKEND_URL` com a URL real gerada pelo Vercel!

## 3. Rodar Migrations no Banco Prisma

Antes de fazer o deploy, você precisa criar as tabelas no banco Prisma:

```bash
cd backend
npx prisma migrate deploy
```

Isso vai criar todas as tabelas (usuarios, restaurantes, pratos, pedidos, enderecos) no banco remoto.

## 4. Fazer Deploy

```bash
git add .
git commit -m "feat: configura backend serverless no Vercel"
git push
```

O Vercel vai automaticamente:
- ✅ Fazer build do frontend (Vite)
- ✅ Fazer deploy do backend como serverless function
- ✅ Gerar o Prisma Client
- ✅ Conectar com o Prisma Accelerate

## 5. Verificar Deploy

Após o deploy (2-3 minutos):

1. **Frontend**: https://world-bite.vercel.app
2. **Backend API**: https://world-bite.vercel.app/api/

## 6. Testar Funcionalidades

Teste estas páginas:
- ✅ Home: https://world-bite.vercel.app/
- ✅ Login: https://world-bite.vercel.app/login
- ✅ Cadastro: https://world-bite.vercel.app/cadastro-usuario
- ✅ Pedidos: https://world-bite.vercel.app/pedidos

## Troubleshooting

### ❌ Erro 500 no Backend

**Solução**: Verifique os logs:
1. Vercel Dashboard → Seu Projeto → Deployments
2. Clique no deployment mais recente
3. Vá em "Functions" → Clique em alguma function → "View Logs"
4. Procure por erros de DATABASE_URL ou Prisma

### ❌ "Table 'usuarios' does not exist"

**Solução**: Rode as migrations:
```bash
cd backend
npx prisma migrate deploy
```

### ❌ CORS Error

**Solução**: 
1. Verifique se `FRONTEND_URL` está correto no Vercel
2. O backend já tem CORS configurado, não precisa mexer

### ❌ Mercado Pago não funciona

**Causa**: O Mercado Pago exige HTTPS para pagamentos com cartão
**Solução**: No Vercel você tem HTTPS automático! Teste diretamente na URL do Vercel (não no localhost)

## 7. Configurar Webhooks do Mercado Pago (Importante!)

Depois do deploy, configure os webhooks:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione seu aplicativo
3. Configure Webhooks:
   - URL: `https://world-bite.vercel.app/api/pagamentos/webhook`
   - Eventos: `payment.created`, `payment.updated`

Isso permite que o Mercado Pago notifique seu backend sobre mudanças no status de pagamento.

## 8. Próximos Passos

Após o deploy funcionar:

1. ✅ Teste todos os fluxos principais
2. ✅ Configure Facebook OAuth com a URL do Vercel
3. ✅ Migre dados do banco local para o Prisma (se necessário)
4. ✅ Configure domínio customizado (opcional)

## Comandos Úteis

```bash
# Ver logs do Prisma Accelerate
npx prisma studio

# Resetar banco (CUIDADO - apaga tudo!)
cd backend
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status
```

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Prisma: https://www.prisma.io/docs
- Logs em tempo real: Vercel Dashboard → Functions → View Logs
