# Sistema de Nota Fiscal Automática - World Bite

## 📋 Descrição

Sistema completo de geração e envio automático de Nota Fiscal em PDF para clientes após a finalização do pedido.

## ✨ Funcionalidades

### 1. Geração Automática de PDF
- ✅ Documento profissional e organizado
- ✅ Dados completos do cliente, restaurante e pedido
- ✅ Número único da nota fiscal
- ✅ Tabela detalhada de itens
- ✅ Totalizadores com taxa de entrega
- ✅ Código de retirada (quando aplicável)
- ✅ Formatação de CPF, CNPJ, telefones e valores monetários

### 2. Envio Automático por Email
- ✅ Email HTML profissional
- ✅ PDF anexado automaticamente
- ✅ Resumo do pedido no corpo do email
- ✅ Mensagem amigável e informativa

### 3. Segurança e Performance
- ✅ Arquivos temporários deletados após envio
- ✅ Validação de dados obrigatórios
- ✅ Tratamento de erros elegante
- ✅ Logs detalhados para debug

## 🚀 Como Usar

### Backend

A rota `/api/pedidos/finalizar` agora aceita os seguintes dados:

```javascript
{
  "clienteId": 1,
  "restauranteId": 1,
  "tipoEntrega": "entrega" | "retirada",
  "itens": "[...]", // JSON string dos itens
  "valorTotal": 100.50,
  "taxaEntrega": 10.00,
  "observacoes": "Sem cebola",
  "cpfCnpjNota": "12345678900",
  
  // Dados do cliente (obrigatório)
  "cliente": {
    "nome": "João Silva",
    "email": "joao@email.com", // OBRIGATÓRIO
    "cpf": "12345678900",
    "celular": "11999999999"
  },
  
  // Endereço (apenas para entrega)
  "endereco": {
    "cep": "12345678",
    "rua": "Rua Exemplo",
    "numero": "123",
    "complemento": "Apto 45",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  }
}
```

### Resposta de Sucesso

```javascript
{
  "sucesso": true,
  "success": true,
  "pedido": { /* dados do pedido */ },
  "mensagem": "Pedido criado! Código de retirada: 1234",
  "message": "Nota fiscal enviada para o e-mail do cliente."
}
```

### Resposta de Erro

```javascript
{
  "success": false,
  "sucesso": false,
  "error": "Erro interno ao finalizar pedido",
  "message": "Não foi possível finalizar o pedido. Tente novamente em alguns instantes.",
  "detalhes": "Mensagem de erro técnica"
}
```

## 📁 Estrutura de Arquivos

```
backend/
├── services/
│   ├── notaFiscalService.js  # Geração de PDF
│   └── emailService.js        # Envio de emails (atualizado)
├── routes/
│   └── pedidos.js             # Rota de finalizar pedido (atualizada)
└── temp/                      # Arquivos PDF temporários
    └── .gitignore             # Ignora PDFs no git
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Email (já configurado)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=worldbite01.impacta@gmail.com
EMAIL_PASS=wcyp sbum lvrh teyc
EMAIL_FROM="World Bite <worldbite01.impacta@gmail.com>"
EMAIL_SECURE=false
```

### Dependências

```json
{
  "pdfkit": "^0.17.2",      // Geração de PDF
  "nodemailer": "^6.x.x"     // Envio de email
}
```

## 📧 Template de Email

O email enviado contém:
- ✅ Cabeçalho com logo World Bite
- ✅ Saudação personalizada
- ✅ Resumo do pedido (número, tipo, valor)
- ✅ Código de retirada destacado (quando aplicável)
- ✅ Dica sobre guardar a nota fiscal
- ✅ Rodapé profissional
- ✅ PDF anexado

## 🎨 Layout da Nota Fiscal

1. **Cabeçalho**
   - Logo World Bite
   - Número da NF
   - Data de emissão
   - Número do pedido

2. **Dados do Emitente**
   - Nome do restaurante
   - CNPJ
   - Endereço
   - Telefone

3. **Dados do Cliente**
   - Nome completo
   - Email
   - CPF
   - Telefone
   - Endereço completo (se entrega)

4. **Itens do Pedido**
   - Tabela formatada
   - Quantidade, preço unitário e subtotal
   - Linhas alternadas para melhor leitura

5. **Totalizadores**
   - Subtotal
   - Taxa de entrega
   - Total destacado

6. **Informações Adicionais**
   - Observações (se houver)
   - Código de retirada destacado (se aplicável)

7. **Rodapé**
   - Informações legais
   - Contato

## 🔒 Segurança

- ✅ Arquivos PDF são temporários
- ✅ Deletados automaticamente após 5 segundos do envio
- ✅ Não armazena dados sensíveis desnecessários
- ✅ Validação de dados obrigatórios
- ✅ Tratamento de erros sem expor detalhes técnicos

## 🐛 Debug

### Logs do Backend

```bash
📥 Recebendo pedido para finalizar
💾 Criando pedido no banco de dados...
✅ Pedido criado com sucesso! ID: 1
📄 Gerando nota fiscal...
✅ Nota fiscal gerada: NF_123456.pdf
📧 Enviando nota fiscal por email...
✅ Nota fiscal enviada com sucesso!
🗑️ Arquivo deletado: NF_123456.pdf
```

### Verificar Email

1. Conferir configurações SMTP no `.env`
2. Verificar se o email do cliente é válido
3. Checar pasta de spam
4. Conferir logs do backend para erros

## 📝 Notas Importantes

1. **Email Obrigatório**: O email do cliente é obrigatório para o envio da nota fiscal
2. **Endereço**: Apenas necessário para pedidos do tipo "entrega"
3. **CPF/CNPJ**: Opcional no campo `cpfCnpjNota` para incluir na nota
4. **Código de Retirada**: Gerado automaticamente para todos os pedidos
5. **Arquivos Temporários**: Deletados automaticamente, não ocupam espaço

## 🎯 Próximos Passos (Opcional)

- [ ] Integrar com sistema de numeração sequencial de NF
- [ ] Adicionar QR Code na nota fiscal
- [ ] Gerar também em formato XML (para nota fiscal eletrônica)
- [ ] Permitir ao usuário baixar a NF pela plataforma
- [ ] Histórico de notas fiscais no perfil do cliente
- [ ] Enviar SMS com link para download da NF

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs do backend
2. Conferir configurações de email
3. Validar dados enviados na requisição
4. Verificar se o diretório `temp/` existe e tem permissões

---

**Desenvolvido para World Bite** 🌍🍽️
