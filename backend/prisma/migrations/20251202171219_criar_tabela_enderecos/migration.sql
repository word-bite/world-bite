-- CreateTable
CREATE TABLE "public"."Endereco" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "complemento" TEXT,
    "apelido" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Endereco" ADD CONSTRAINT "Endereco_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
