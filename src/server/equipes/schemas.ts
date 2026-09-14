import { z } from "zod";

export const criarEquipeSchema = z.object({
  nome: z.string().trim().min(2).max(60),
  hackathonId: z.string().optional(),
});

export const entrarEquipeSchema = z.object({
  codigo: z.string().trim().min(4).max(20),
});

export const transferirLiderancaSchema = z.object({
  userId: z.string().min(1),
});

export const hackathonQuerySchema = z.object({
  hackathonId: z.string().optional(),
});

export const adminEquipesQuerySchema = z.object({
  hackathonId: z.string().optional(),
  situacao: z.enum(["EM_FORMACAO", "INSCRITA", "DESCLASSIFICADA"]).optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminAtualizarEquipeSchema = z.strictObject({
  nome: z.string().trim().min(2).max(60).optional(),
  situacao: z.enum(["EM_FORMACAO", "INSCRITA", "DESCLASSIFICADA"]).optional(),
  liderId: z.string().nullable().optional(),
});
