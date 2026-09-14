import { z } from "zod";

const texto = (max: number) => z.string().trim().min(1).max(max);
const opcional = (max: number) => z.string().trim().max(max).nullable().optional();
const data = z.coerce.date();

export const hackathonIdQuerySchema = z.object({ hackathonId: z.string().optional() });

// ---------- Hackathon ----------

const hackathonCampos = z.object({
  nome: texto(120),
  descricao: texto(5000),
  dataInicio: data,
  dataFim: data,
  inscricaoInicio: data.nullable().optional(),
  inscricaoFim: data.nullable().optional(),
  prazoSubmissao: data.nullable().optional(),
  status: z.enum(["RASCUNHO", "INSCRICOES_ABERTAS", "EM_ANDAMENTO", "ENCERRADO"]).optional(),
  limiteMinIntegrantes: z.number().int().min(1).max(50).optional(),
  limiteMaxIntegrantes: z.number().int().min(1).max(50).optional(),
  juradosPorProjeto: z.number().int().min(1).max(50).optional(),
  permitirEdicaoAvaliacao: z.boolean().optional(),
  notaMin: z.number().min(0).max(1000).optional(),
  notaMax: z.number().min(0).max(1000).optional(),
  exibirNotasPublicas: z.boolean().optional(),
  regulamentoUrl: z.url().nullable().optional(),
  regulamentoTexto: opcional(50000),
});

type HackathonCampos = Partial<z.infer<typeof hackathonCampos>>;

/** Regras entre campos; em updates, valida contra o registro já salvo. */
export function validarHackathon(d: HackathonCampos) {
  const erros: string[] = [];
  if (d.dataInicio && d.dataFim && d.dataInicio > d.dataFim) erros.push("dataInicio deve ser anterior a dataFim");
  if (d.inscricaoInicio && d.inscricaoFim && d.inscricaoInicio > d.inscricaoFim) {
    erros.push("inscricaoInicio deve ser anterior a inscricaoFim");
  }
  if (d.limiteMinIntegrantes != null && d.limiteMaxIntegrantes != null && d.limiteMinIntegrantes > d.limiteMaxIntegrantes) {
    erros.push("limiteMinIntegrantes não pode ser maior que limiteMaxIntegrantes");
  }
  if (d.notaMin != null && d.notaMax != null && d.notaMin >= d.notaMax) {
    erros.push("notaMin deve ser menor que notaMax");
  }
  return erros;
}

export const hackathonCreateSchema = hackathonCampos;
export const hackathonUpdateSchema = hackathonCampos.partial().strict();

// ---------- Desafio ----------

export const desafioCreateSchema = z.object({
  hackathonId: z.string().optional(),
  titulo: texto(160),
  descricao: texto(10000),
  categoria: opcional(80),
  responsavel: opcional(120),
  publicado: z.boolean().optional(),
  ordem: z.number().int().optional(),
});
export const desafioUpdateSchema = desafioCreateSchema.omit({ hackathonId: true }).partial().strict();

// ---------- Agenda ----------

export const agendaCreateSchema = z.object({
  hackathonId: z.string().optional(),
  titulo: texto(160),
  horarioInicio: data,
  horarioFim: data.nullable().optional(),
  local: opcional(160),
  observacoes: opcional(2000),
});
export const agendaUpdateSchema = agendaCreateSchema.omit({ hackathonId: true }).partial().strict();

// ---------- Critério ----------

const criterioCampos = z.strictObject({
  hackathonId: z.string().optional(),
  nome: texto(120),
  descricao: opcional(2000),
  peso: z.number().positive().max(1000).optional(),
  ordem: z.number().int().optional(),
  prioridadeDesempate: z.number().int().min(1).nullable().optional(),
});
export const criterioCreateSchema = criterioCampos;
export const criterioUpdateSchema = criterioCampos.omit({ hackathonId: true }).partial().strict();

// ---------- Comunicado ----------

export const comunicadoCreateSchema = z.object({
  hackathonId: z.string().optional(),
  titulo: texto(160),
  conteudo: texto(20000),
  publicar: z.boolean().optional(),
});
export const comunicadoUpdateSchema = comunicadoCreateSchema.omit({ hackathonId: true }).partial().strict();

// ---------- Projeto ----------

const projetoCampos = z.object({
  nome: texto(120),
  descricao: texto(5000),
  solucao: opcional(10000),
  desafioId: z.string().nullable().optional(),
  tecnologias: z.array(z.string().trim().min(1).max(40)).max(30),
  links: z.array(z.object({ tipo: texto(40), url: z.url() })).max(20),
  arquivos: z.array(z.object({ nome: texto(160), url: z.url() })).max(20),
  /** true = envia para avaliação (situação ENVIADO). */
  enviar: z.boolean().optional(),
});
export const projetoCreateSchema = projetoCampos.extend({
  tecnologias: projetoCampos.shape.tecnologias.default([]),
  links: projetoCampos.shape.links.default([]),
  arquivos: projetoCampos.shape.arquivos.default([]),
});
export const projetoUpdateSchema = projetoCampos.partial().strict();

// ---------- Avaliação ----------

export const avaliacaoSchema = z.object({
  notas: z
    .array(z.object({ criterioId: z.string(), nota: z.number(), comentario: opcional(5000) }))
    .min(1),
  comentario: opcional(5000),
});

export const atribuicoesSchema = z.object({
  projetoIds: z.array(z.string()).min(1),
});

export const autorizarJuradoSchema = z.object({ userId: z.string() });

export const publicarResultadosSchema = z.object({
  hackathonId: z.string().optional(),
  publicado: z.boolean().default(true),
});

export const adminProjetosQuerySchema = z.object({
  hackathonId: z.string().optional(),
  situacao: z.enum(["RASCUNHO", "ENVIADO", "DESCLASSIFICADO"]).optional(),
});
