-- AlterTable
ALTER TABLE "Comunicado" ADD COLUMN "origem" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "completaEm" DATETIME;

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registradoPorId" TEXT,
    "registradoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Presenca_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presenca_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Presenca_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hackathon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "inscricaoInicio" DATETIME,
    "inscricaoFim" DATETIME,
    "prazoSubmissao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "local" TEXT,
    "limiteMinIntegrantes" INTEGER NOT NULL DEFAULT 3,
    "limiteMaxIntegrantes" INTEGER NOT NULL DEFAULT 5,
    "juradosPorProjeto" INTEGER NOT NULL DEFAULT 3,
    "permitirEdicaoAvaliacao" BOOLEAN NOT NULL DEFAULT true,
    "notaMin" REAL NOT NULL DEFAULT 0,
    "notaMax" REAL NOT NULL DEFAULT 10,
    "regulamentoUrl" TEXT,
    "regulamentoTexto" TEXT,
    "resultadosPublicados" BOOLEAN NOT NULL DEFAULT false,
    "resultadosPublicadosEm" DATETIME,
    "exibirNotasPublicas" BOOLEAN NOT NULL DEFAULT false,
    "exibirEquipesPublicas" BOOLEAN NOT NULL DEFAULT false,
    "limiteEquipes" INTEGER,
    "comunicarMudancasAgenda" BOOLEAN NOT NULL DEFAULT true,
    "retencaoDadosDias" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_Hackathon" ("atualizadoEm", "criadoEm", "dataFim", "dataInicio", "descricao", "exibirEquipesPublicas", "exibirNotasPublicas", "id", "inscricaoFim", "inscricaoInicio", "juradosPorProjeto", "limiteMaxIntegrantes", "limiteMinIntegrantes", "local", "nome", "notaMax", "notaMin", "permitirEdicaoAvaliacao", "prazoSubmissao", "regulamentoTexto", "regulamentoUrl", "resultadosPublicados", "resultadosPublicadosEm", "status") SELECT "atualizadoEm", "criadoEm", "dataFim", "dataInicio", "descricao", "exibirEquipesPublicas", "exibirNotasPublicas", "id", "inscricaoFim", "inscricaoInicio", "juradosPorProjeto", "limiteMaxIntegrantes", "limiteMinIntegrantes", "local", "nome", "notaMax", "notaMin", "permitirEdicaoAvaliacao", "prazoSubmissao", "regulamentoTexto", "regulamentoUrl", "resultadosPublicados", "resultadosPublicadosEm", "status" FROM "Hackathon";
DROP TABLE "Hackathon";
ALTER TABLE "new_Hackathon" RENAME TO "Hackathon";
CREATE INDEX "Hackathon_status_idx" ON "Hackathon"("status");
CREATE TABLE "new_RegistroAvaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projetoId" TEXT NOT NULL,
    "juradoId" TEXT NOT NULL,
    "criterioId" TEXT NOT NULL,
    "notaAnterior" REAL,
    "notaNova" REAL NOT NULL,
    "comentario" TEXT,
    "registradoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alteradoPorId" TEXT,
    "justificativa" TEXT,
    CONSTRAINT "RegistroAvaliacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegistroAvaliacao_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegistroAvaliacao_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "Criterio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegistroAvaliacao_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegistroAvaliacao" ("comentario", "criterioId", "id", "juradoId", "notaAnterior", "notaNova", "projetoId", "registradoEm") SELECT "comentario", "criterioId", "id", "juradoId", "notaAnterior", "notaNova", "projetoId", "registradoEm" FROM "RegistroAvaliacao";
DROP TABLE "RegistroAvaliacao";
ALTER TABLE "new_RegistroAvaliacao" RENAME TO "RegistroAvaliacao";
CREATE INDEX "RegistroAvaliacao_projetoId_registradoEm_idx" ON "RegistroAvaliacao"("projetoId", "registradoEm");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_hackathonId_userId_key" ON "Presenca"("hackathonId", "userId");
