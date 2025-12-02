// backend/routes/restaurantes.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Função para converter "12:00" -> DateTime
function timeToDateTime(timeString) {
  if (!timeString) return null;
  return new Date(`2025-01-01T${timeString}:00.000Z`);
}

/*
  ==========================================================
  1. Criar restaurante (POST /restaurantes)
  ==========================================================
*/
router.post("/", async (req, res) => {
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
        erro: "Campos obrigatórios: nome, cnpj, endereco, pais_id.",
      });
    }

    const novoRestaurante = await prisma.restaurante.create({
      data: {
        nome,
        cnpj: cnpj.replace(/\D/g, ""),
        descricao,
        endereco,
        telefone_contato,
        email_contato,
        pais_id,
        horario_abertura: timeToDateTime(horario_abertura),
        horario_fechamento: timeToDateTime(horario_fechamento),
      },
    });

    return res.status(201).json({
      sucesso: true,
      restaurante: novoRestaurante,
      mensagem: "Restaurante cadastrado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar restaurante:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        sucesso: false,
        erro: "CNPJ já cadastrado.",
      });
    }

    res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao cadastrar restaurante.",
    });
  }
});

/*
  ==========================================================
  2. Listar restaurantes (GET /restaurantes)
  ==========================================================
*/
router.get("/", async (req, res) => {
  try {
    const restaurantes = await prisma.restaurante.findMany({
      orderBy: { nome: "asc" },
    });

    res.json({ sucesso: true, restaurantes });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao buscar restaurantes.",
    });
  }
});

/*
  ==========================================================
  3. Buscar por ID (GET /restaurantes/:id)
  ==========================================================
*/
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const restaurante = await prisma.restaurante.findUnique({
      where: { id },
    });

    if (!restaurante) {
      return res.status(404).json({
        sucesso: false,
        erro: "Restaurante não encontrado.",
      });
    }

    res.json({ sucesso: true, restaurante });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar restaurante.",
    });
  }
});

/*
  ==========================================================
  4. Atualizar restaurante (PUT /restaurantes/:id)
  ==========================================================
*/
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const dataAtualizada = { ...req.body };

    if (req.body.horario_abertura) {
      dataAtualizada.horario_abertura = timeToDateTime(req.body.horario_abertura);
    }

    if (req.body.horario_fechamento) {
      dataAtualizada.horario_fechamento = timeToDateTime(req.body.horario_fechamento);
    }

    const restaurante = await prisma.restaurante.update({
      where: { id },
      data: dataAtualizada,
    });

    res.json({
      sucesso: true,
      restaurante,
      mensagem: "Restaurante atualizado com sucesso!",
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao atualizar restaurante.",
    });
  }
});

/*
  ==========================================================
  5. Deletar restaurante (DELETE /restaurantes/:id)
  ==========================================================
*/
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.restaurante.delete({ where: { id } });

    res.json({
      sucesso: true,
      mensagem: "Restaurante excluído com sucesso!",
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao excluir restaurante.",
    });
  }
});

module.exports = router;
