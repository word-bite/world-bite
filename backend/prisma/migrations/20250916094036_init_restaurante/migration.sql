-- CreateTable
CREATE TABLE "public"."Restaurantes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "descricao" TEXT,
    "endereco" TEXT NOT NULL,
    "telefone_contato" VARCHAR(20),
    "email_contato" VARCHAR(255),
    "nota_media" DECIMAL(3,2) DEFAULT 0.00,
    "tempo_medio_entrega" INTEGER,
    "pais_id" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN DEFAULT true,
    "horario_abertura" TIME,
    "horario_fechamento" TIME,
    "data_criacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurantes_cnpj_key" ON "public"."Restaurantes"("cnpj");
