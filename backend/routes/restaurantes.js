app.post('/restaurantes', async (req, res) => {
    try {
        const {
            nome,
            cnpj,
            descricao,
            endereco,
            telefone_contato,
            email_contato,
            pais_id,
            horario_abertura,
            horario_fechamento,
        } = req.body;

        if (!nome || !cnpj || !endereco || !pais_id) {
            return res.status(400).json({
                sucesso: false,
                erro: "Campos obrigatórios: nome, cnpj, endereco e pais_id."
            });
        }

        // Converte "12:00" -> DateTime
        function timeToDateTime(time) {
            if (!time) return null;
            return new Date(`2025-01-01T${time}:00.000Z`);
        }

        const novoRestaurante = await prisma.restaurante.create({
            data: {
                nome,
                cnpj: cnpj.replace(/\D/g, ''), // limpa CNPJ
                descricao,
                endereco,
                telefone_contato,
                email_contato,
                pais_id,
                horario_abertura: timeToDateTime(horario_abertura),
                horario_fechamento: timeToDateTime(horario_fechamento)
            }
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: "Restaurante cadastrado com sucesso!",
            restaurante: novoRestaurante
        });

    } catch (error) {
        console.error("❌ Erro ao cadastrar restaurante:", error);

        if (error.code === "P2002") {
            return res.status(400).json({
                sucesso: false,
                erro: "CNPJ já cadastrado."
            });
        }

        res.status(500).json({
            sucesso: false,
            erro: "Erro interno ao cadastrar restaurante."
        });
    }
});
