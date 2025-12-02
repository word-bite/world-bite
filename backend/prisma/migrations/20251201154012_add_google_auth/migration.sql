/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."pedidos" ADD COLUMN     "avaliacao" INTEGER,
ADD COLUMN     "comentario_avaliacao" TEXT;

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "foto_perfil" VARCHAR(500),
ADD COLUMN     "google_id" VARCHAR(255),
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_google_id_key" ON "public"."usuarios"("google_id");
