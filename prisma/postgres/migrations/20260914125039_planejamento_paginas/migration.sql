-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "exibirEquipesPublicas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "local" TEXT;

-- AlterTable
ALTER TABLE "AgendaItem" ADD COLUMN     "cancelado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RegistroAvaliacao" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "juradoId" TEXT NOT NULL,
    "criterioId" TEXT NOT NULL,
    "notaAnterior" DOUBLE PRECISION,
    "notaNova" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroAvaliacao_projetoId_registradoEm_idx" ON "RegistroAvaliacao"("projetoId", "registradoEm");

-- AddForeignKey
ALTER TABLE "RegistroAvaliacao" ADD CONSTRAINT "RegistroAvaliacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAvaliacao" ADD CONSTRAINT "RegistroAvaliacao_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAvaliacao" ADD CONSTRAINT "RegistroAvaliacao_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "Criterio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

