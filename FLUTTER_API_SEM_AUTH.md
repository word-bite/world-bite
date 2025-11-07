# 🔓 API Pública - Sem Autenticação

## ✅ Rotas Públicas Implementadas

Estas rotas **NÃO** requerem autenticação e podem ser acessadas diretamente pelo Flutter:

### 1. Listar Pratos (Públic)
```
GET https://world-bite.vercel.app/api/restaurante/prato/publico
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Bife Acebolado",
    "descricao": "Bife bovino com cebolas caramelizadas",
    "preco": 32.90,
    "categoria": "PRINCIPAL",
    "disponivel": true,
    "urlImagem": "https://example.com/bife.jpg",
    "restauranteId": 1,
    "restaurante": {
      "id": 1,
      "nome": "Sabor da Casa",
      "endereco": "Rua das Flores, 123 - São Paulo"
    }
  }
]
```

### 2. Listar Pedidos (Público)
```
GET https://world-bite.vercel.app/api/pedidos/publico
GET https://world-bite.vercel.app/api/pedidos/publico?status=pronto
GET https://world-bite.vercel.app/api/pedidos/publico?restauranteId=1
```

**Resposta:**
```json
{
  "sucesso": true,
  "pedidos": [
    {
      "id": 1,
      "clienteId": 3,
      "restauranteId": 1,
      "cliente": "João Silva",
      "restaurante": "Sabor da Casa",
      "status": "pendente",
      "valorTotal": 78.40,
      "taxaEntrega": 8.90,
      "tipoEntrega": "entrega",
      "codigoRetirada": null,
      "observacoes": "Sem cebola",
      "itens": [
        {
          "pratoId": 1,
          "nome": "Bife Acebolado",
          "quantidade": 1,
          "preco": 32.90
        }
      ],
      "criadoEm": "2025-11-07T10:30:00Z",
      "atualizadoEm": "2025-11-07T10:30:00Z"
    }
  ]
}
```

### 3. Criar Pedido (Sem Autenticação)
```
POST https://world-bite.vercel.app/api/pedidos
```

**Body:**
```json
{
  "clienteId": 3,
  "restauranteId": 1,
  "status": "pendente",
  "valorTotal": 78.40,
  "taxaEntrega": 8.90,
  "tipo": "entrega",
  "formaPagamento": "dinheiro",
  "observacoes": "Sem cebola",
  "itens": [
    {
      "pratoId": 1,
      "nome": "Bife Acebolado",
      "quantidade": 1,
      "preco": 32.90
    }
  ]
}
```

### 4. Atualizar Status (Sem Autenticação)
```
PUT https://world-bite.vercel.app/api/pedidos/1/status
```

**Body:**
```json
{
  "status": "preparando"
}
```

## 📱 Atualização no Flutter

### Arquivo: `lib/services/api_service.dart`

Atualize os métodos para usar as rotas públicas:

```dart
// ANTES (com erro 401)
Future<List<Prato>> getPratos() async {
  final url = Uri.parse('${ApiConfig.baseUrl}/api/restaurante/prato');
  // ...
}

// DEPOIS (sem autenticação)
Future<List<Prato>> getPratos() async {
  final url = Uri.parse('${ApiConfig.baseUrl}/api/restaurante/prato/publico');
  // ...
}
```

```dart
// ANTES
Future<List<Pedido>> getPedidos({String? status}) async {
  String endpoint = '/api/pedidos';
  // ...
}

// DEPOIS
Future<List<Pedido>> getPedidos({String? status}) async {
  String endpoint = '/api/pedidos/publico';
  if (status != null) {
    endpoint += '?status=$status';
  }
  
  final response = await http.get(
    Uri.parse('${ApiConfig.baseUrl}$endpoint'),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    final pedidosList = data['pedidos'] as List; // Acessa array dentro de 'pedidos'
    return pedidosList.map((p) => Pedido.fromJson(p)).toList();
  }
  // ...
}
```

## 🚀 Deploy

Faça commit e push para aplicar as mudanças:

```bash
git add backend/routes/pratos.js backend/routes/pedidos.js
git commit -m "feat: adiciona rotas públicas sem autenticação para pratos e pedidos"
git push origin main
```

Aguarde 1-2 minutos para o Vercel fazer o deploy.

## ✅ Testando

### 1. Teste direto no navegador:
```
https://world-bite.vercel.app/api/restaurante/prato/publico
https://world-bite.vercel.app/api/pedidos/publico
```

### 2. Teste com curl:
```bash
curl https://world-bite.vercel.app/api/restaurante/prato/publico
curl https://world-bite.vercel.app/api/pedidos/publico?status=pronto
```

### 3. Teste no Flutter:
```bash
flutter run
```

## 🔐 Segurança

**⚠️ AVISO:** Esta é uma implementação simplificada para desenvolvimento/testes.

Em **produção**, você deve:
- ✅ Implementar autenticação JWT
- ✅ Limitar rate (max requests por IP)
- ✅ Validar origem das requisições
- ✅ Implementar RBAC (Role-Based Access Control)
- ✅ Proteger dados sensíveis (CPF, telefone, etc.)

## 📊 Comparação

| Rota | Antes | Depois |
|------|-------|--------|
| Pratos | `GET /api/restaurante/prato` (401) | `GET /api/restaurante/prato/publico` (200) |
| Pedidos | `GET /api/pedidos` (requer auth) | `GET /api/pedidos/publico` (200) |
| Criar Pedido | `POST /api/pedidos` (OK) | `POST /api/pedidos` (OK) |
| Status | `PUT /api/pedidos/:id/status` (OK) | `PUT /api/pedidos/:id/status` (OK) |

---

**Data:** 07/11/2025  
**Versão:** 1.1.0
