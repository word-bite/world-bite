/*
  Warnings:

  - You are about to alter the column `tipo_entrega` on the `pedidos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `codigo_retirada` on the `pedidos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - You are about to alter the column `status` on the `pedidos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the `enderecos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."enderecos" DROP CONSTRAINT "enderecos_usuario_id_fkey";

-- AlterTable
ALTER TABLE "public"."pedidos" ADD COLUMN     "taxa_entrega" DECIMAL(10,2) DEFAULT 0,
ALTER COLUMN "tipo_entrega" SET DEFAULT 'entrega',
ALTER COLUMN "tipo_entrega" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "codigo_retirada" SET DATA TYPE VARCHAR(4),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "itens" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."enderecos";
