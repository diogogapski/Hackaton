export type EdicaoHome = {
  nome: string;
  descricao: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  local: string | null;
  limiteMinIntegrantes: number;
  limiteMaxIntegrantes: number;
  limiteEquipes: number | null;
  inscricoesAbertas: boolean;
};

export type DesafioHome = {
  titulo: string;
  descricao: string;
  categoria: string | null;
  responsavel: string | null;
};

export type AgendaHome = {
  id: string;
  titulo: string;
  horarioInicio: string;
  horarioFim: string | null;
  local: string | null;
};

export type VencedorHome = {
  posicao: number;
  projeto: string;
  equipe: string;
  desafio: string | null;
};

export type DadosHome = {
  edicao: EdicaoHome;
  desafio: DesafioHome | null;
  agenda: AgendaHome[];
  vencedores: VencedorHome[];
};
