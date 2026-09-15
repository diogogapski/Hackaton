/**
 * Preenche um site vazio com conteúdo de exemplo pela própria API do admin: edição, critérios,
 * desafios, agenda e comunicados. Não cria contas nem equipes falsas.
 *
 *   BASE=https://seu-site ADMIN_EMAIL=... ADMIN_SENHA=... npm run conteudo:exemplo
 *
 * Roda quantas vezes quiser: o que já existe (mesmo título/nome) não é recriado. Tudo pode ser
 * editado ou apagado depois nas telas do admin.
 */
const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL;
const SENHA = process.env.ADMIN_SENHA;

if (!EMAIL || !SENHA) {
  console.error("Defina ADMIN_EMAIL e ADMIN_SENHA (e BASE, se não for localhost).");
  process.exit(1);
}
let cookie = "";

async function req(metodo, caminho, corpo) {
  const r = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: { "content-type": "application/json", origin: BASE, ...(cookie ? { cookie } : {}) },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const set = r.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  const json = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`${metodo} ${caminho} → ${r.status} ${JSON.stringify(json)}`);
  return json;
}

const iso = (s) => new Date(`${s}-03:00`).toISOString();

await req("POST", "/api/auth/login", { identificador: EMAIL, senha: SENHA });
console.log("login ok");

const { hackathons } = await req("GET", "/api/admin/hackathons");
let hackathon = hackathons[0];
if (!hackathon) {
  ({ hackathon } = await req("POST", "/api/admin/hackathons", {
    nome: "1º HackIF — IFPR Campus Pinhais",
    descricao:
      "Maratona de desenvolvimento do curso de Ciência da Computação do IFPR — Campus Pinhais. " +
      "Equipes de 3 a 5 pessoas escolhem um desafio real do campus e da comunidade e têm dois dias " +
      "para entregar um protótipo funcional, apresentado a uma banca de jurados.",
    local: "IFPR — Campus Pinhais",
    dataInicio: iso("2026-10-09T08:00"),
    dataFim: iso("2026-10-10T18:00"),
    inscricaoInicio: iso("2026-09-15T00:00"),
    inscricaoFim: iso("2026-10-02T23:59"),
    prazoSubmissao: iso("2026-10-10T12:00"),
    status: "INSCRICOES_ABERTAS",
    limiteMinIntegrantes: 3,
    limiteMaxIntegrantes: 5,
    juradosPorProjeto: 3,
    notaMin: 0,
    notaMax: 10,
    limiteEquipes: 25,
    exibirEquipesPublicas: true,
    comunicarMudancasAgenda: true,
    retencaoDadosDias: 365,
    regulamentoTexto: [
      "1. Participação",
      "Podem participar alunos do IFPR, servidores, egressos e convidados externos, em equipes de 3 a 5 integrantes.",
      "Cada pessoa participa de uma única equipe. A equipe só é considerada inscrita ao atingir o mínimo de integrantes.",
      "",
      "2. Inscrições",
      "As inscrições vão de 15/09/2026 a 02/10/2026, pelo site, com aceite dos termos de uso e da política de privacidade.",
      "São aceitas até 25 equipes; equipes completas além desse limite entram em lista de espera, na ordem de formação.",
      "",
      "3. Desenvolvimento",
      "O trabalho acontece entre 09/10/2026 às 08h e 10/10/2026 às 12h, prazo final de envio do projeto pelo site.",
      "Cada equipe escolhe um dos desafios publicados. É permitido usar bibliotecas e serviços de terceiros, desde que declarados.",
      "O código produzido deve ser autoral e ficar acessível em repositório público.",
      "",
      "4. Avaliação",
      "Cada projeto é avaliado por três jurados, com notas de 0 a 10 nos critérios Inovação (peso 2), Execução técnica (peso 2), " +
        "Impacto (peso 1) e Apresentação (peso 1). A nota final é a média ponderada.",
      "Em caso de empate, vale a maior nota em Inovação; persistindo, Execução técnica; por fim, a equipe que enviou primeiro.",
      "",
      "5. Resultados",
      "O resultado é divulgado no site após a conclusão de todas as avaliações. A decisão da banca é soberana.",
      "",
      "6. Conduta",
      "Plágio, uso de trabalho pronto de terceiros ou desrespeito a participantes levam à desclassificação.",
    ].join("\n"),
  }));
  console.log("edição criada:", hackathon.nome);
}
const hackathonId = hackathon.id;

const criterios = [
  { nome: "Inovação", descricao: "Originalidade da ideia e da abordagem diante do desafio escolhido.", peso: 2, ordem: 1, prioridadeDesempate: 1 },
  { nome: "Execução técnica", descricao: "Qualidade do que foi construído: funciona, está organizado e é sustentável.", peso: 2, ordem: 2, prioridadeDesempate: 2 },
  { nome: "Impacto", descricao: "Tamanho do problema resolvido e benefício real para o campus ou a comunidade.", peso: 1, ordem: 3, prioridadeDesempate: 3 },
  { nome: "Apresentação", descricao: "Clareza do pitch, da demonstração e do domínio da solução pela equipe.", peso: 1, ordem: 4 },
];
const desafios = [
  {
    titulo: "Campus Inteligente",
    categoria: "Infraestrutura",
    responsavel: "Direção de Ensino",
    descricao:
      "Salas ocupadas, laboratórios livres, avisos e mapa do campus estão espalhados em murais e grupos de mensagem. " +
      "Como reunir essas informações em um só lugar, atualizado e fácil de consultar pelo celular?",
    ordem: 1,
    publicado: true,
  },
  {
    titulo: "Permanência e Êxito",
    categoria: "Educação",
    responsavel: "Coordenação de Ciência da Computação",
    descricao:
      "Boa parte das desistências dá sinais antes de acontecer: faltas seguidas, notas caindo, sumiço das atividades. " +
      "Como ajudar a coordenação a enxergar esses sinais cedo e agir, sem expor ninguém e respeitando a LGPD?",
    ordem: 2,
    publicado: true,
  },
  {
    titulo: "Cidade Sustentável",
    categoria: "Sustentabilidade",
    responsavel: "Prefeitura de Pinhais — Meio Ambiente",
    descricao:
      "Descarte irregular de lixo e entulho é um problema recorrente nos bairros vizinhos ao campus. " +
      "Como facilitar o registro dos pontos críticos pela população e o acompanhamento das providências?",
    ordem: 3,
    publicado: true,
  },
  {
    titulo: "Acessibilidade no Ensino",
    categoria: "Inclusão",
    responsavel: "NAPNE — IFPR",
    descricao:
      "Materiais de aula nem sempre chegam em formato acessível para estudantes com deficiência visual ou auditiva. " +
      "Como apoiar professores a produzir e distribuir esses materiais sem retrabalho?",
    ordem: 4,
    publicado: true,
  },
];
const agenda = [
  { titulo: "Abertura e apresentação dos desafios", horarioInicio: iso("2026-10-09T08:00"), horarioFim: iso("2026-10-09T09:00"), local: "Auditório", observacoes: "Credenciamento a partir das 07h30." },
  { titulo: "Início do desenvolvimento", horarioInicio: iso("2026-10-09T09:00"), horarioFim: iso("2026-10-09T12:00"), local: "Laboratórios 1 e 2" },
  { titulo: "Mentoria com professores e parceiros", horarioInicio: iso("2026-10-09T14:00"), horarioFim: iso("2026-10-09T17:00"), local: "Laboratórios 1 e 2", observacoes: "Rodadas de 20 minutos por equipe." },
  { titulo: "Checkpoint: demonstração parcial", horarioInicio: iso("2026-10-09T19:00"), horarioFim: iso("2026-10-09T20:00"), local: "Auditório" },
  { titulo: "Prazo final de envio dos projetos", horarioInicio: iso("2026-10-10T12:00"), local: "Pelo site" },
  { titulo: "Apresentações finais para a banca", horarioInicio: iso("2026-10-10T14:00"), horarioFim: iso("2026-10-10T17:00"), local: "Auditório", observacoes: "8 minutos de pitch e 4 de perguntas por equipe." },
  { titulo: "Resultado e encerramento", horarioInicio: iso("2026-10-10T17:30"), horarioFim: iso("2026-10-10T18:00"), local: "Auditório" },
];
const comunicados = [
  {
    titulo: "Inscrições abertas para o 1º HackIF",
    conteudo:
      "As inscrições vão até 02/10/2026. Crie sua conta, monte uma equipe de 3 a 5 pessoas e compartilhe o código de convite " +
      "com o time. São 25 vagas; equipes completas além disso entram na lista de espera.",
    publicar: true,
  },
  {
    titulo: "Desafios publicados",
    conteudo:
      "Os quatro desafios desta edição já estão no site. A escolha do desafio é feita na hora de enviar o projeto, " +
      "então dá para decidir durante o evento.",
    publicar: true,
  },
];

// A chave da lista varia por rota (criterios, desafios, agenda, comunicados): pega o primeiro array.
const existentes = async (caminho) => {
  const json = await req("GET", `${caminho}?hackathonId=${hackathonId}`);
  const lista = Object.values(json).find(Array.isArray) ?? [];
  return new Set(lista.map((i) => i.titulo ?? i.nome));
};

for (const [caminho, campo, itens] of [
  ["/api/admin/criterios", "criterios", criterios],
  ["/api/admin/desafios", "desafios", desafios],
  ["/api/admin/agenda", "agenda", agenda],
  ["/api/admin/comunicados", "comunicados", comunicados],
]) {
  const jaExiste = await existentes(caminho);
  let criados = 0;
  for (const item of itens) {
    if (jaExiste.has(item.titulo ?? item.nome)) continue;
    await req("POST", caminho, { ...item, hackathonId });
    criados++;
  }
  console.log(`${campo}: ${criados} criado(s), ${jaExiste.size} já existia(m)`);
}

for (const caminho of ["/api/hackathon/atual", "/api/desafios", "/api/agenda", "/api/comunicados"]) {
  const json = await req("GET", caminho);
  const lista = Object.values(json).find(Array.isArray);
  console.log(`público ${caminho}: ${lista ? `${lista.length} item(ns)` : (json.hackathon?.nome ?? "ok")}`);
}
