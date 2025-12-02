-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "telefone" VARCHAR(20),
    "facebook_id" VARCHAR(255),
    "avatar_url" VARCHAR(500),
    "provider" VARCHAR(50) DEFAULT 'local',
    "codigo_verificacao" VARCHAR(10),
    "codigo_expira_em" TIMESTAMPTZ,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "telefone_verificado" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMPTZ NOT NULL,
    "ultimo_login" TIMESTAMPTZ,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefone_key" ON "public"."usuarios"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_facebook_id_key" ON "public"."usuarios"("facebook_id");
