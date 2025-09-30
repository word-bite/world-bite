// server-sem-banco.js
// Servidor que funciona SEM PostgreSQL para demonstração

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Simulação de banco em memória para demonstração
let usuarios = [];
let nextId = 1;

// Função para gerar código de verificação
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// === APIS DE USUÁRIOS (SEM BANCO DE DADOS) ===

/**
 * 1. CADASTRAR USUÁRIO
 */
app.post('/api/usuarios/cadastro', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    // Validações
    if (!nome) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Nome é obrigatório'
      });
    }

    if (!email && !telefone) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Email ou telefone é obrigatório'
      });
    }

    // Verificar se já existe
    const existe = usuarios.find(u => 
      (email && u.email === email) || 
      (telefone && u.telefone === telefone)
    );

    if (existe) {
      return res.status(409).json({
        sucesso: false,
        erro: 'Usuário já cadastrado com este email ou telefone'
      });
    }

    // Criar usuário
    const novoUsuario = {
      id: nextId++,
      nome: nome.trim(),
      email: email || null,
      telefone: telefone || null,
      codigo_verificacao: null,
      codigo_expira_em: null,
      email_verificado: false,
      telefone_verificado: false,
      ativo: true,
      data_criacao: new Date().toISOString(),
      ultimo_login: null
    };

    usuarios.push(novoUsuario);

    console.log(`✅ Usuário cadastrado: ${nome} - ${email || telefone}`);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 2. ENVIAR CÓDIGO POR EMAIL
 */
app.post('/api/usuarios/codigo-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Email é obrigatório'
      });
    }

    // Buscar ou criar usuário
    let usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      // Criar usuário automaticamente (padrão iFood)
      usuario = {
        id: nextId++,
        nome: `Usuário ${email.split('@')[0]}`,
        email: email,
        telefone: null,
        codigo_verificacao: null,
        codigo_expira_em: null,
        email_verificado: false,
        telefone_verificado: false,
        ativo: true,
        data_criacao: new Date().toISOString(),
        ultimo_login: null
      };
      usuarios.push(usuario);
      console.log(`🆕 Usuário criado automaticamente: ${email}`);
    }

    // Gerar e salvar código
    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    usuario.codigo_verificacao = codigo;
    usuario.codigo_expira_em = expiraEm.toISOString();

    // Simular envio de email
    console.log('📧 CÓDIGO DE VERIFICAÇÃO POR EMAIL');
    console.log(`Email: ${email}`);
    console.log(`Código: ${codigo}`);
    console.log(`Expira: ${expiraEm.toLocaleString()}`);
    console.log('─'.repeat(50));

    res.json({
      sucesso: true,
      mensagem: 'Código enviado por email',
      codigoParaTeste: codigo // Para facilitar testes acadêmicos
    });

  } catch (error) {
    console.error('Erro ao enviar código por email:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 3. ENVIAR CÓDIGO POR SMS
 */
app.post('/api/usuarios/codigo-sms', async (req, res) => {
  try {
    const { telefone } = req.body;

    if (!telefone) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Telefone é obrigatório'
      });
    }

    // Buscar ou criar usuário
    let usuario = usuarios.find(u => u.telefone === telefone);

    if (!usuario) {
      usuario = {
        id: nextId++,
        nome: `Usuário ${telefone}`,
        email: null,
        telefone: telefone,
        codigo_verificacao: null,
        codigo_expira_em: null,
        email_verificado: false,
        telefone_verificado: false,
        ativo: true,
        data_criacao: new Date().toISOString(),
        ultimo_login: null
      };
      usuarios.push(usuario);
      console.log(`🆕 Usuário criado automaticamente: ${telefone}`);
    }

    // Gerar e salvar código
    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

    usuario.codigo_verificacao = codigo;
    usuario.codigo_expira_em = expiraEm.toISOString();

    // Simular envio de SMS
    console.log('📱 CÓDIGO DE VERIFICAÇÃO POR SMS');
    console.log(`Telefone: ${telefone}`);
    console.log(`Código: ${codigo}`);
    console.log(`Expira: ${expiraEm.toLocaleString()}`);
    console.log('─'.repeat(50));

    res.json({
      sucesso: true,
      mensagem: 'Código enviado por SMS',
      codigoParaTeste: codigo
    });

  } catch (error) {
    console.error('Erro ao enviar código por SMS:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 4. LOGIN COM CÓDIGO
 */
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { identificador, codigo } = req.body;

    if (!identificador || !codigo) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Identificador (email/telefone) e código são obrigatórios'
      });
    }

    // Buscar usuário
    const usuario = usuarios.find(u => 
      u.email === identificador || u.telefone === identificador
    );

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Usuário não encontrado'
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        sucesso: false,
        erro: 'Conta desativada'
      });
    }

    // Verificar código
    if (!usuario.codigo_verificacao || 
        usuario.codigo_verificacao !== codigo ||
        !usuario.codigo_expira_em ||
        new Date() > new Date(usuario.codigo_expira_em)) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Código inválido ou expirado'
      });
    }

    // Login bem-sucedido
    usuario.codigo_verificacao = null;
    usuario.codigo_expira_em = null;
    usuario.ultimo_login = new Date().toISOString();

    if (identificador.includes('@')) {
      usuario.email_verificado = true;
    } else {
      usuario.telefone_verificado = true;
    }

    console.log(`🔐 Login realizado: ${usuario.nome} (${identificador})`);

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      token: `token_${usuario.id}_${Date.now()}`,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        email_verificado: usuario.email_verificado,
        telefone_verificado: usuario.telefone_verificado,
        ultimo_login: usuario.ultimo_login
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 5. LISTAR USUÁRIOS
 */
app.get('/api/usuarios', (req, res) => {
  try {
    const usuariosAtivos = usuarios.filter(u => u.ativo);
    
    res.json({
      sucesso: true,
      total: usuariosAtivos.length,
      usuarios: usuariosAtivos.map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        email_verificado: u.email_verificado,
        telefone_verificado: u.telefone_verificado,
        data_criacao: u.data_criacao,
        ultimo_login: u.ultimo_login
      }))
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 6. BUSCAR USUÁRIO POR ID
 */
app.get('/api/usuarios/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = usuarios.find(u => u.id === id && u.ativo);

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Usuário não encontrado'
      });
    }

    res.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        email_verificado: usuario.email_verificado,
        telefone_verificado: usuario.telefone_verificado,
        data_criacao: usuario.data_criacao,
        ultimo_login: usuario.ultimo_login
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 7. ATUALIZAR USUÁRIO
 */
app.put('/api/usuarios/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, telefone } = req.body;
    
    const usuario = usuarios.find(u => u.id === id && u.ativo);

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Usuário não encontrado'
      });
    }

    if (nome) usuario.nome = nome.trim();
    if (telefone) usuario.telefone = telefone;

    console.log(`📝 Usuário atualizado: ${usuario.nome} (ID: ${id})`);

    res.json({
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

/**
 * 8. DESATIVAR USUÁRIO
 */
app.delete('/api/usuarios/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = usuarios.find(u => u.id === id && u.ativo);

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Usuário não encontrado'
      });
    }

    usuario.ativo = false;
    console.log(`🗑️ Usuário desativado: ${usuario.nome} (ID: ${id})`);

    res.json({
      sucesso: true,
      mensagem: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    mensagem: '🚀 World Bite API - Servidor SEM Banco de Dados',
    modo: 'MEMÓRIA (Ideal para Testes Acadêmicos)',
    usuarios_cadastrados: usuarios.filter(u => u.ativo).length,
    apis: {
      usuarios: {
        cadastro: 'POST /api/usuarios/cadastro',
        codigo_email: 'POST /api/usuarios/codigo-email',
        codigo_sms: 'POST /api/usuarios/codigo-sms',
        login: 'POST /api/usuarios/login',
        listar: 'GET /api/usuarios',
        buscar: 'GET /api/usuarios/:id',
        atualizar: 'PUT /api/usuarios/:id',
        desativar: 'DELETE /api/usuarios/:id'
      }
    },
    observacoes: [
      '✅ Funciona SEM PostgreSQL',
      '✅ Dados em memória (resetam ao reiniciar)',
      '✅ Códigos aparecem no console',
      '✅ Ideal para demonstrações acadêmicas'
    ],
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'World Bite API - Servidor Acadêmico',
    status: 'Funcionando sem banco de dados',
    documentacao: 'GET /api/status'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`📍 Servidor rodando em http://localhost:${PORT}`);
  console.log('💡 Servidor SEM banco de dados (dados em memória)');
  console.log('🎓 Ideal para demonstrações acadêmicas');
  console.log('📊 Status: GET /api/status');
  console.log('================================');
});