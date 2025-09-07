# WoldBite API - Login sem Senha

Sistema de autenticação moderno **apenas com email + código de verificação**.

## 🚀 Funcionalidades

- ✅ **Login sem senha** - apenas email + código
- ✅ Verificação por email com código de 6 dígitos  
- ✅ Dados opcionais (nome, CPF)
- ✅ JWT para autenticação
- ✅ Mais seguro e simples

## 🔧 Instalação

```bash
npm install
npm run db:migrate  
npm start
```

## 📱 Como usar

### 1. Enviar código
```bash
POST /api/auth/send-code
{
  "email": "usuario@email.com"
}
```

### 2. Login com código
```bash
POST /api/auth/login
{
  "email": "usuario@email.com",
  "code": "123456",
  "name": "Nome (opcional)",
  "cpf": "12345678901 (opcional)"
}
```

### 3. Acessar perfil
```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

## 📚 Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/send-code` - Enviar código
- `POST /api/auth/login` - Login com código
- `POST /api/auth/verify-code` - Verificar código
- `POST /api/auth/register` - Completar dados
- `GET /api/auth/profile` - Perfil (protegido)

## 💡 Vantagens

✅ **Sem senhas para esquecer**  
✅ **Mais seguro** - sem ataques de força bruta  
✅ **Experiência simples** - apenas email + código  
✅ **Moderno** - padrão de grandes apps  

## 🛠️ Stack

Node.js • Express • Prisma • SQLite • JWT • Joi • Nodemailer
