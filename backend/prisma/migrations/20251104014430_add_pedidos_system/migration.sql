-- CreateTable
CREATE TABLE "public"."pedidos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "tipo_entrega" TEXT NOT NULL,
    "codigo_retirada" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "itens" JSONB NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedidos" ADD CONSTRAINT "pedidos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "public"."Restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
