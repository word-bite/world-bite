-- CreateEnum
CREATE TYPE "public"."CategoriaPrato" AS ENUM ('PRINCIPAL', 'SOBREMESA', 'ENTRADA', 'BEBIDA', 'PROMOCAO');

-- CreateTable
CREATE TABLE "public"."pratos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "categoria" "public"."CategoriaPrato" NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "url_imagem" VARCHAR(255),
    "data_criacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMPTZ NOT NULL,
    "restaurante_id" INTEGER NOT NULL,

    CONSTRAINT "pratos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."pratos" ADD CONSTRAINT "pratos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "public"."Restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
