-- AlterEnum
ALTER TYPE "SituacaoEquipe" ADD VALUE 'LISTA_ESPERA';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "completaEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "comunicarMudancasAgenda" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "limiteEquipes" INTEGER,
ADD COLUMN     "retencaoDadosDias" INTEGER;

-- AlterTable
ALTER TABLE "RegistroAvaliacao" ADD COLUMN     "alteradoPorId" TEXT,
ADD COLUMN     "justificativa" TEXT;

-- AlterTable
ALTER TABLE "Comunicado" ADD COLUMN     "origem" TEXT;

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registradoPorId" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_hackathonId_userId_key" ON "Presenca"("hackathonId", "userId");

-- AddForeignKey
ALTER TABLE "RegistroAvaliacao" ADD CONSTRAINT "RegistroAvaliacao_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

