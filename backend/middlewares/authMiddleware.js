// backend/middlewares/authMiddleware.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para verificar se o CNPJ foi enviado e obter o ID do restaurante
const authRestaurante = async (req, res, next) => {
    
    const authHeader = req.headers['authorization'];
    
    // 1. Verifica se o cabeçalho está presente e no formato correto
    if (!authHeader || !authHeader.startsWith('CNPJ ')) {
        return res.status(401).json({ error: 'Acesso negado. CNPJ não fornecido no cabeçalho.' });
    }

    // 2. Extrai o CNPJ puro do cabeçalho
    const cnpjComFormato = authHeader.split(' ')[1];
    
    if (!cnpjComFormato) {
        return res.status(401).json({ error: 'CNPJ inválido.' });
    }
    
    // 3. Limpa o CNPJ (remove pontos, traços, barras)
    const cnpjLimpo = cnpjComFormato.replace(/[^\d]/g, '');

    try {
        // 4. Busca o restaurante no banco de dados
        const restaurante = await prisma.restaurante.findUnique({
            where: { cnpj: cnpjLimpo },
            select: { id: true, nome: true }
        });

        // 5. Se não encontrar o restaurante, nega o acesso
        if (!restaurante) {
            return res.status(404).json({ error: 'Restaurante não encontrado ou inativo.' });
        }

        // 6. Anexa o ID e o Nome do restaurante à requisição
        req.restauranteId = restaurante.id;
        req.restauranteNome = restaurante.nome; 
        
        // 7. Chama a próxima função/rota
        next(); 

    } catch (error) {
        console.error('Erro de autenticação:', error);
        return res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
    }
};

// 🔑 Exporta a função usando CommonJS para ser compatível com require()
module.exports = authRestaurante;