-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerificadoEm" DATETIME;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "ativoKey" TEXT;

-- Preserva o acesso das contas legadas; confirmação passa a ser obrigatória nos novos cadastros.
UPDATE "User" SET "emailVerificadoEm" = CURRENT_TIMESTAMP WHERE "emailVerificadoEm" IS NULL;

-- Materializa a regra de uma participação ativa por usuário e edição antes de criar o índice único.
UPDATE "TeamMember"
SET "ativoKey" = "userId" || ':' || (
  SELECT "hackathonId" FROM "Team" WHERE "Team"."id" = "TeamMember"."teamId"
)
WHERE "saiuEm" IS NULL;

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" DATETIME NOT NULL,
    "usadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_tokenHash_key" ON "EmailVerification"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerification_userId_usadoEm_idx" ON "EmailVerification"("userId", "usadoEm");

-- CreateIndex
CREATE INDEX "EmailVerification_email_usadoEm_idx" ON "EmailVerification"("email", "usadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_ativoKey_key" ON "TeamMember"("ativoKey");
