/**
 * Teste de fluxo ponta a ponta da API: do banco vazio à publicação dos resultados, cobrindo as regras
 * de docs/00, 01, 02 e docs/BACKEND.md. Precisa de um servidor rodando sobre um banco SEM dados:
 *
 *   DATABASE_URL="file:./prisma/fluxo.db" npx prisma migrate deploy
 *   DATABASE_URL="file:./prisma/fluxo.db" ADMIN_EMAIL=admin@teste.dev ADMIN_SENHA=Admin@2026! npm run admin:create
 *   DATABASE_URL="file:./prisma/fluxo.db" npm run dev > servidor.log
 *   ADMIN_EMAIL=admin@teste.dev ADMIN_SENHA=Admin@2026! LOG=servidor.log npm run test:fluxo
 *
 * Variáveis: BASE (padrão http://localhost:3000), ADMIN_EMAIL, ADMIN_SENHA e LOG (opcional: log do
 * `next dev`, usado para ler o link de redefinição de senha; sem ele essa parte é pulada).
 */
import { existsSync, readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const LOG = process.env.LOG;
const ADMIN = { email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA };
if (!ADMIN.email || !ADMIN.senha) {
  console.error("Defina ADMIN_EMAIL e ADMIN_SENHA (admin criado com npm run admin:create).");
  process.exit(1);
}

let falhas = 0, total = 0;
// Hashes nunca saem da API, e nenhuma senha usada no teste pode voltar em resposta.
const CHAVES_PROIBIDAS = /"(senhaHash|tokenHash)"\s*:|Senha@123|Nova@12345|Recuperada@1|Admin@2026!|\$2[aby]\$\d\d\$/;

function check(nome, cond, extra) {
  total++;
  if (cond) console.log(`  ok    ${nome}`);
  else { falhas++; console.log(`  FALHA ${nome} ${JSON.stringify(extra)?.slice(0, 500) ?? ""}`); }
}
const titulo = (t) => console.log(`\n# ${t}`);

let ipSeq = 0;
function cliente(nome) {
  let cookie = "";
  const ip = `10.77.${Math.floor(ipSeq / 250)}.${(ipSeq++ % 250) + 1}`;
  const req = async (method, path, body) => {
    const res = await fetch(BASE + path, {
      method,
      headers: { "content-type": "application/json", cookie, "x-forwarded-for": ip },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    const texto = await res.text();
    if (CHAVES_PROIBIDAS.test(texto)) {
      falhas++; total++;
      console.log(`  FALHA [${nome}] resposta de ${method} ${path} expôs campo sensível`);
    }
    let json = null;
    try { json = JSON.parse(texto); } catch {}
    return { status: res.status, json };
  };
  req.nome = nome;
  req.cookie = () => cookie; // para requisições cruas (ex.: download de CSV)
  return req;
}

const s = Date.now().toString().slice(-6);
const dias = (n) => new Date(Date.now() + n * 864e5).toISOString();
const pub = cliente("publico");
let r;

// ---------------------------------------------------------------- 1
titulo("1. Banco vazio e admin inicial (admin:create)");
r = await pub("GET", "/api/health"); check("health 200", r.json?.ok === true, r);
r = await pub("GET", "/api/hackathon/atual"); check("sem edição: 404", r.status === 404, r);
r = await pub("GET", "/api/resultados"); check("resultados sem edição: 404", r.status === 404, r);
const adm = cliente("admin");
r = await adm("POST", "/api/auth/login", { identificador: ADMIN.email, senha: ADMIN.senha });
check("login do admin criado por admin:create", r.status === 200 && r.json.user.papel === "ADMIN", r);
r = await pub("GET", "/api/admin/dashboard"); check("rota admin sem login: 401", r.status === 401, r);

// ---------------------------------------------------------------- 2
titulo("2. Edição (doc 02 §1 Hackathon, §5 Hackathons) — configurável no banco");
r = await adm("POST", "/api/admin/hackathons", { nome: `HackIF Fluxo ${s}`, descricao: "Edição de teste", dataInicio: dias(10), dataFim: dias(12) });
check("cria edição (padrão RASCUNHO, 3–5 integrantes)", r.status === 201 && r.json.hackathon.status === "RASCUNHO" && r.json.hackathon.limiteMinIntegrantes === 3 && r.json.hackathon.limiteMaxIntegrantes === 5, r);
const H = r.json.hackathon.id;
r = await pub("GET", "/api/hackathon/atual"); check("rascunho não é público", r.status === 404, r);
r = await pub("GET", `/api/desafios?hackathonId=${H}`); check("rascunho não é público por id", r.status === 404, r);
r = await adm("GET", `/api/admin/dashboard?hackathonId=${H}`); check("admin vê rascunho no dashboard", r.status === 200, r);
r = await adm("PUT", `/api/admin/hackathons/${H}`, { dataInicio: dias(20), dataFim: dias(1) }); check("datas invertidas: 400", r.status === 400, r);
r = await adm("PUT", `/api/admin/hackathons/${H}`, { limiteMinIntegrantes: 5, limiteMaxIntegrantes: 4 }); check("min > max integrantes: 400", r.status === 400, r);
r = await adm("PUT", `/api/admin/hackathons/${H}`, {
  status: "INSCRICOES_ABERTAS", limiteMinIntegrantes: 3, limiteMaxIntegrantes: 4, juradosPorProjeto: 2,
  notaMin: 0, notaMax: 10, permitirEdicaoAvaliacao: false, inscricaoInicio: dias(-1), inscricaoFim: dias(5),
  prazoSubmissao: dias(11), regulamentoTexto: "Art. 1º Regulamento de teste.",
});
check("configura status, limites 3–4, 2 jurados/projeto, escala 0–10, sem reenvio", r.status === 200 && r.json.hackathon.limiteMaxIntegrantes === 4, r);
r = await pub("GET", "/api/hackathon/atual");
check("edição vigente pública com flags", r.json?.hackathon?.id === H && r.json.hackathon.inscricoesAbertas && r.json.hackathon.submissaoAberta && r.json.hackathon.regulamentoTexto, r);

// ---------------------------------------------------------------- 3
titulo("3. Desafios, agenda, comunicados e critérios (doc 02 §2 e §5)");
r = await adm("POST", "/api/admin/desafios", { titulo: "Desafio publicado", descricao: "d", publicado: true, categoria: "Educação", responsavel: "Prof. X" });
const D1 = r.json?.desafio?.id; check("cria desafio publicado", r.status === 201, r);
r = await adm("POST", "/api/admin/desafios", { titulo: "Desafio oculto", descricao: "d" });
const D2 = r.json?.desafio?.id; check("cria desafio não publicado", r.status === 201 && r.json.desafio.publicado === false, r);
r = await pub("GET", "/api/desafios"); check("público vê só publicados", r.json?.desafios?.length === 1 && r.json.desafios[0].id === D1, r);
r = await adm("POST", "/api/admin/agenda", { titulo: "Encerramento", horarioInicio: dias(12) });
r = await adm("POST", "/api/admin/agenda", { titulo: "Abertura", horarioInicio: dias(10), horarioFim: dias(10.1), local: "Auditório" });
r = await adm("POST", "/api/admin/agenda", { titulo: "Invertido", horarioInicio: dias(10), horarioFim: dias(9) }); check("agenda com fim antes do início: 400", r.status === 400, r);
r = await adm("GET", "/api/admin/agenda");
const encerramento = r.json.agenda.find((a) => a.titulo === "Encerramento");
r = await adm("PUT", `/api/admin/agenda/${encerramento.id}`, { cancelado: true }); check("admin cancela atividade (planejamento p.28)", r.json?.item?.cancelado === true, r);
check("cancelamento publica comunicado automático", /cancelada/.test(r.json?.comunicado?.titulo ?? "") && r.json.comunicado.publicadoEm, r.json?.comunicado);
r = await pub("GET", "/api/agenda"); check("atividade cancelada continua visível e marcada", r.json?.agenda?.some((a) => a.titulo === "Encerramento" && a.cancelado), r);
r = await adm("PUT", `/api/admin/agenda/${encerramento.id}`, { cancelado: false }); check("reativação publica comunicado automático", /confirmada novamente/.test(r.json?.comunicado?.titulo ?? ""), r.json);
const noMinuto = new Date(Math.floor(new Date(encerramento.horarioInicio).getTime() / 60000) * 60000).toISOString();
r = await adm("PUT", `/api/admin/agenda/${encerramento.id}`, { horarioInicio: noMinuto }); check("salvar sem mudança real (horário sem segundos) não gera comunicado", r.status === 200 && r.json.comunicado === null, r.json);
await adm("PUT", `/api/admin/hackathons/${H}`, { comunicarMudancasAgenda: false });
r = await adm("PUT", `/api/admin/agenda/${encerramento.id}`, { local: "Lab 1" }); check("com a opção desligada, mudança não gera comunicado", r.json?.comunicado === null, r.json);
await adm("PUT", `/api/admin/hackathons/${H}`, { comunicarMudancasAgenda: true });
r = await adm("PUT", `/api/admin/agenda/${encerramento.id}`, { horarioInicio: new Date(new Date(noMinuto).getTime() + 3600_000).toISOString(), local: "Auditório" });
check("mudança de horário e local publica comunicado com antes e depois", /início: .* -> .*local: Lab 1 -> Auditório/.test(r.json?.comunicado?.conteudo ?? ""), r.json?.comunicado);
r = await adm("POST", "/api/admin/agenda", { titulo: "Temporária", horarioInicio: dias(11) });
r = await adm("DELETE", `/api/admin/agenda/${r.json.item.id}`);
r = await pub("GET", "/api/comunicados");
check("remoção de atividade publica comunicado (canvas: mudança chega a todos)", r.json?.comunicados?.some((c) => /Temporária.*saiu da programação/.test(c.titulo)), r.json);
r = await pub("GET", "/api/agenda"); check("agenda pública ordenada por horário", r.json?.agenda?.map((a) => a.titulo).join() === "Abertura,Encerramento", r);
await adm("POST", "/api/admin/comunicados", { titulo: "Rascunho", conteudo: "x" });
r = await adm("POST", "/api/admin/comunicados", { titulo: "Publicado", conteudo: "y", publicar: true });
check("comunicado publicado com publicadoEm", r.status === 201 && r.json.comunicado.publicadoEm, r);
r = await pub("GET", "/api/comunicados"); check("público vê só comunicados publicados (1 manual + 4 automáticos da agenda)", r.json?.comunicados?.length === 5 && !r.json.comunicados.some((c) => c.titulo === "Rascunho"), r.json?.comunicados?.map((c) => c.titulo));
const crit = {};
for (const c of [
  { nome: "Inovação", peso: 3, prioridadeDesempate: 1, ordem: 1 },
  { nome: "Técnica", peso: 1, ordem: 2 },
  { nome: "Impacto", peso: 1, ordem: 3 },
]) {
  r = await adm("POST", "/api/admin/criterios", c);
  crit[c.nome] = r.json?.criterio?.id;
}
check("cria 3 critérios com pesos e desempate", Object.values(crit).every(Boolean), crit);
r = await adm("POST", "/api/admin/criterios", { nome: "Com escala própria", notaMax: 5 }); check("critério não aceita escala própria (escala é da edição)", r.status === 400, r);
r = await adm("POST", "/api/admin/criterios", { nome: "Temporário" });
r = await adm("DELETE", `/api/admin/criterios/${r.json.criterio.id}`); check("exclui critério sem notas", r.status === 200, r);

// ---------------------------------------------------------------- 4
titulo("4. Cadastro e login (doc 01 §2)");
const U = {};
async function registrar(chave, tipo, corpo) {
  const c = cliente(chave);
  const res = await c("POST", `/api/auth/register/${tipo}`, { senha: "Senha@123", aceiteTermos: true, ...corpo });
  U[chave] = { c, id: res.json?.user?.id, ...corpo };
  return res;
}
for (let i = 1; i <= 8; i++) {
  r = await registrar(`A${i}`, "aluno", { nome: `Aluno ${i}`, email: `a${i}.${s}@t.dev`, matricula: `M${i}${s}`, curso: "CC" });
}
check("8 alunos cadastrados, papel PARTICIPANTE, termos registrados", r.status === 201 && r.json.user.papel === "PARTICIPANTE" && r.json.user.termosAceitosEm, r);
r = await registrar("S1", "servidor", { nome: "Servidor 1", email: `s1.${s}@ifpr.edu.br`, siape: `S${s}` }); check("servidor cadastrado", r.status === 201 && r.json.user.vinculo === "SERVIDOR", r);
const cpf = "52998224725";
r = await registrar("E1", "externo", { nome: "Externo 1", email: `e1.${s}@t.dev`, vinculo: "EXTERNO", cpf: "529.982.247-25" }); check("externo com CPF (normalizado)", r.status === 201, r);
r = await registrar("E2", "externo", { nome: "Egresso 2", email: `e2.${s}@t.dev`, vinculo: "EGRESSO" }); check("egresso sem CPF (LGPD: opcional)", r.status === 201, r);
r = await cliente()("POST", "/api/auth/register/aluno", { nome: "Dup", email: `outro.${s}@t.dev`, matricula: `M1${s}`, curso: "CC", senha: "Senha@123", aceiteTermos: true }); check("matrícula duplicada: 409", r.status === 409, r);
r = await cliente()("POST", "/api/auth/register/servidor", { nome: "Dup", email: `outro2.${s}@t.dev`, siape: `S${s}`, senha: "Senha@123", aceiteTermos: true }); check("SIAPE duplicado: 409", r.status === 409, r);
r = await cliente()("POST", "/api/auth/register/externo", { nome: "Dup", email: `outro3.${s}@t.dev`, vinculo: "EXTERNO", cpf, senha: "Senha@123", aceiteTermos: true }); check("CPF duplicado: 409", r.status === 409, r);
r = await cliente()("POST", "/api/auth/register/aluno", { nome: "Dup", email: `A1.${s}@T.DEV`.replace("A1", "a1"), matricula: `Z${s}`, curso: "CC", senha: "Senha@123", aceiteTermos: true }); check("e-mail duplicado (sem diferenciar maiúsculas): 409", r.status === 409, r);
r = await cliente()("POST", "/api/auth/register/aluno", { nome: "Sem termos", email: `st.${s}@t.dev`, matricula: `T${s}`, curso: "CC", senha: "Senha@123" }); check("sem aceite dos termos: 400", r.status === 400, r);
r = await cliente()("POST", "/api/auth/register/aluno", { nome: "Curta", email: `sc.${s}@t.dev`, matricula: `C${s}`, curso: "CC", senha: "123", aceiteTermos: true }); check("senha curta: 400", r.status === 400, r);
r = await cliente()("POST", "/api/auth/login", { identificador: `M2${s}`, vinculo: "ALUNO", senha: "Senha@123" }); check("login por matrícula + vínculo", r.status === 200, r);
r = await cliente()("POST", "/api/auth/login", { identificador: `S${s}`, vinculo: "SERVIDOR", senha: "Senha@123" }); check("login por SIAPE + vínculo", r.status === 200, r);
r = await cliente()("POST", "/api/auth/register/externo", { nome: "Egresso com CPF", email: `egcpf.${s}@t.dev`, vinculo: "EGRESSO", cpf: "111.444.777-35", senha: "Senha@123", aceiteTermos: true });
r = await cliente()("POST", "/api/auth/login", { identificador: "11144477735", vinculo: "EXTERNO", senha: "Senha@123" });
check("egresso entra pelo acesso externo com CPF (/login/externo)", r.status === 200 && r.json.user.vinculo === "EGRESSO", r);
r = await cliente()("POST", "/api/auth/login", { identificador: "529.982.247-25", vinculo: "EXTERNO", senha: "Senha@123" }); check("login por CPF + vínculo", r.status === 200, r);
r = await cliente()("POST", "/api/auth/login", { identificador: `M2${s}`, senha: "Senha@123" }); check("matrícula sem vínculo: 401", r.status === 401, r);
r = await cliente()("POST", "/api/auth/login", { identificador: `a2.${s}@t.dev`, senha: "errada" }); check("senha errada: 401", r.status === 401, r);

// ---------------------------------------------------------------- 5
titulo("5. Perfil (doc 01 §3)");
r = await U.A1.c("GET", "/api/perfil"); check("GET perfil do logado", r.json?.user?.email === U.A1.email, r);
r = await U.A1.c("PUT", "/api/perfil", { nome: "Aluno Um", telefone: "41 99999-0000" }); check("edita nome e contato", r.json?.user?.nome === "Aluno Um", r);
r = await U.A1.c("PUT", "/api/perfil", { matricula: "OUTRA" }); check("matrícula bloqueada: 400", r.status === 400, r);
r = await U.E1.c("PUT", "/api/perfil", { cpf: "00000000000" }); check("CPF bloqueado: 400", r.status === 400, r);
r = await U.A1.c("PUT", "/api/perfil", { papel: "ADMIN" }); check("papel não editável pelo usuário: 400", r.status === 400, r);
r = await U.A1.c("PUT", "/api/perfil", { email: U.A2.email }); check("e-mail em uso: 409", r.status === 409, r);
r = await U.A1.c("PUT", "/api/perfil/senha", { senhaAtual: "errada", novaSenha: "Nova@12345" }); check("troca de senha exige a atual", r.status === 400, r);
const outroDispositivo = cliente("A1-outro");
await outroDispositivo("POST", "/api/auth/login", { identificador: U.A1.email, senha: "Senha@123" });
await new Promise((ok) => setTimeout(ok, 1100)); // o iat do JWT tem resolução de 1s
r = await U.A1.c("PUT", "/api/perfil/senha", { senhaAtual: "Senha@123", novaSenha: "Nova@12345" }); check("troca de senha", r.status === 200, r);
r = await U.A1.c("GET", "/api/perfil"); check("quem trocou a senha continua logado", r.status === 200, r);
r = await outroDispositivo("GET", "/api/perfil"); check("sessões de outros dispositivos são encerradas", r.status === 401, r);
r = await cliente()("POST", "/api/auth/login", { identificador: U.A1.email, senha: "Nova@12345" }); check("login com a nova senha", r.status === 200, r);

// ---------------------------------------------------------------- 6
titulo("6. Recuperação de senha (doc 01 §2)");
r = await pub("POST", "/api/auth/recuperar-senha", { email: `naoexiste.${s}@t.dev` }); check("e-mail inexistente: resposta genérica 200", r.status === 200, r);
r = await U.A8.c("POST", "/api/auth/recuperar-senha", { email: U.A8.email }); check("solicita recuperação", r.status === 200, r);
await new Promise((ok) => setTimeout(ok, 700));
const link = LOG && existsSync(LOG) && [...readFileSync(LOG, "utf8").matchAll(new RegExp(`${U.A8.email.replace(/\./g, "\\.")}: \\S+token=(\\S+)`, "g"))].pop();
if (!LOG) console.log("  --    redefinição pelo link pulada (defina LOG com o log do next dev)");
else check("token gerado (link no console em dev)", Boolean(link), "sem link no log");
if (link) {
  r = await pub("POST", "/api/auth/redefinir-senha", { token: link[1], novaSenha: "Recuperada@1" }); check("redefine senha com token", r.status === 200, r);
  r = await pub("POST", "/api/auth/redefinir-senha", { token: link[1], novaSenha: "Outra@12345" }); check("token não reutilizável: 400", r.status === 400, r);
  r = await cliente()("POST", "/api/auth/login", { identificador: U.A8.email, senha: "Recuperada@1" }); check("login com senha redefinida", r.status === 200, r);
  r = await U.A8.c("GET", "/api/perfil"); check("redefinição derruba sessões abertas", r.status === 401, r);

  await U.A8.c("POST", "/api/auth/recuperar-senha", { email: U.A8.email });
  await new Promise((ok) => setTimeout(ok, 700));
  const novo = [...readFileSync(LOG, "utf8").matchAll(new RegExp(`${U.A8.email.replace(/\./g, "\\.")}: \\S+token=(\\S+)`, "g"))].pop();
  const simultaneos = await Promise.all([1, 2].map(() => pub("POST", "/api/auth/redefinir-senha", { token: novo[1], novaSenha: "Recuperada@1" })));
  check("mesmo token usado ao mesmo tempo: só uma requisição vence", simultaneos.map((x) => x.status).sort().join() === "200,400", simultaneos.map((x) => x.status));
  await new Promise((ok) => setTimeout(ok, 1100));
  r = await U.A8.c("POST", "/api/auth/login", { identificador: U.A8.email, senha: "Recuperada@1" }); check("login após nova redefinição", r.status === 200, r);
}

// ---------------------------------------------------------------- 7
titulo("7. Equipes (doc 01 §4, regra 3–5 configurável)");
r = await U.A1.c("GET", "/api/equipe"); check("sem equipe: equipe null", r.status === 200 && r.json.equipe === null, r);
r = await U.A1.c("POST", "/api/equipe", { nome: `T1 ${s}` }); check("cria T1: criador é líder, EM_FORMACAO", r.status === 201 && r.json.equipe.liderId === U.A1.id && r.json.equipe.situacao === "EM_FORMACAO", r);
const T1 = r.json.equipe.id; let cod1 = r.json.equipe.codigoConvite;
r = await U.A1.c("POST", "/api/equipe", { nome: `T1b ${s}` }); check("uma equipe por edição: 409", r.status === 409, r);
r = await U.A2.c("POST", "/api/equipe", { nome: `T1 ${s}` }); check("nome repetido na edição: 409", r.status === 409, r);
r = await U.A2.c("POST", "/api/equipe/entrar", { codigo: "INVALIDO" }); check("código inválido: 404", r.status === 404, r);
r = await U.A2.c("POST", "/api/equipe/entrar", { codigo: cod1.toLowerCase() }); check("entra por código (sem diferenciar maiúsculas)", r.status === 200, r);
r = await U.A3.c("POST", "/api/equipe/entrar", { codigo: cod1 }); check("3º integrante: INSCRITA", r.json?.equipe?.situacao === "INSCRITA", r);
r = await U.A2.c("GET", "/api/equipe"); check("membro vê integrantes e líder, não o código", r.json?.equipe?.membros?.length === 3 && r.json.equipe.lider?.id === U.A1.id && r.json.equipe.codigoConvite === null, r);
r = await U.A2.c("POST", "/api/equipe/convite"); check("só líder gera convite: 403", r.status === 403, r);
r = await U.A1.c("POST", "/api/equipe/convite"); check("líder gera novo código", r.status === 200 && r.json.convite.codigoConvite !== cod1, r);
const codAntigo = cod1; cod1 = r.json.convite.codigoConvite;
r = await U.A4.c("POST", "/api/equipe/entrar", { codigo: codAntigo }); check("código antigo deixa de valer: 404", r.status === 404, r);
r = await U.A4.c("POST", "/api/equipe/entrar", { codigo: cod1 }); check("4º integrante (máximo 4)", r.status === 200, r);
r = await U.A5.c("POST", "/api/equipe/entrar", { codigo: cod1 }); check("acima do máximo configurado: 409", r.status === 409, r);
r = await U.A2.c("DELETE", `/api/equipe/membro/${U.A3.id}`); check("não-líder não remove: 403", r.status === 403, r);
r = await U.A2.c("POST", "/api/equipe/transferir-lideranca", { userId: U.A2.id }); check("não-líder não transfere: 403", r.status === 403, r);
r = await U.A1.c("POST", "/api/equipe/transferir-lideranca", { userId: U.A5.id }); check("transferir para quem não é membro: 400", r.status === 400, r);
r = await U.A1.c("POST", "/api/equipe/sair"); check("líder sai", r.status === 200, r);
r = await U.A2.c("GET", "/api/equipe"); check("membro mais antigo (A2) vira líder; equipe nunca sem líder", r.json?.equipe?.liderId === U.A2.id && r.json.equipe.membros.length === 3, r);
r = await U.A2.c("DELETE", `/api/equipe/membro/${U.A4.id}`); check("líder remove membro → EM_FORMACAO", r.json?.equipe?.situacao === "EM_FORMACAO", r);
r = await U.A2.c("DELETE", `/api/equipe/membro/${U.A2.id}`); check("líder não se remove pela rota de remoção: 400", r.status === 400, r);
r = await U.A2.c("POST", "/api/equipe/convite"); cod1 = r.json.convite.codigoConvite;
r = await U.A4.c("POST", "/api/equipe/entrar", { codigo: cod1 }); check("reentrada após saída (histórico preservado) → INSCRITA", r.json?.equipe?.situacao === "INSCRITA", r);
// Lista de espera (canvas: "haverá lista de espera se passar de 25 equipes?") com limite de 2 equipes.
await adm("PUT", `/api/admin/hackathons/${H}`, { limiteEquipes: 2 });
r = await U.A5.c("POST", "/api/equipe", { nome: `T2 ${s}` }); const T2 = r.json.equipe.id; const cod2 = r.json.equipe.codigoConvite;
await U.A6.c("POST", "/api/equipe/entrar", { codigo: cod2 });
r = await U.S1.c("POST", "/api/equipe/entrar", { codigo: cod2 }); check("T2 com aluno + servidor INSCRITA (2ª vaga)", r.json?.equipe?.situacao === "INSCRITA", r);
const X = [];
for (let i = 1; i <= 3; i++) {
  const c = cliente(`X${i}`);
  r = await c("POST", "/api/auth/register/aluno", { nome: `Espera ${i}`, email: `x${i}.${s}@t.dev`, matricula: `X${i}${s}`, curso: "CC", senha: "Senha@123", aceiteTermos: true });
  X.push({ c, id: r.json.user.id });
}
r = await X[0].c("POST", "/api/equipe", { nome: `T4 ${s}` }); const T4 = r.json.equipe.id; const cod4 = r.json.equipe.codigoConvite;
await X[1].c("POST", "/api/equipe/entrar", { codigo: cod4 });
r = await X[2].c("POST", "/api/equipe/entrar", { codigo: cod4 }); check("3ª equipe completa entra na LISTA_ESPERA (limite 2)", r.json?.equipe?.situacao === "LISTA_ESPERA", r.json?.equipe?.situacao);
r = await X[0].c("POST", "/api/projeto", { nome: "P4", descricao: "d", enviar: true }); check("equipe na lista de espera não envia projeto", r.status === 400 && /lista de espera/.test(r.json.error), r);
await adm("PUT", `/api/admin/equipes/${T2}`, { situacao: "DESCLASSIFICADA" });
r = await X[0].c("GET", "/api/equipe"); check("vaga liberada: primeira da lista de espera vira INSCRITA", r.json?.equipe?.situacao === "INSCRITA", r.json?.equipe?.situacao);
r = await adm("PUT", `/api/admin/equipes/${T2}`, { situacao: "EM_FORMACAO" }); check("equipe reativada sem vaga vai para a lista de espera", r.json?.equipe?.situacao === "LISTA_ESPERA", r.json?.equipe?.situacao);
await adm("PUT", `/api/admin/hackathons/${H}`, { limiteEquipes: null });
r = await U.A5.c("GET", "/api/equipe"); check("sem limite, a lista de espera é inscrita", r.json?.equipe?.situacao === "INSCRITA", r.json?.equipe?.situacao);
for (const x of X) await x.c("POST", "/api/equipe/sair");
r = await adm("GET", "/api/admin/equipes?pageSize=100"); check("equipe esvaziada volta a EM_FORMACAO", r.json?.equipes?.find((e) => e.id === T4)?.situacao === "EM_FORMACAO", null);
r = await U.E1.c("POST", "/api/equipe", { nome: `T3 ${s}` }); const T3 = r.json.equipe.id; check("T3 externo sozinho (EM_FORMACAO)", r.status === 201, r);

// ---------------------------------------------------------------- 8
titulo("8. Submissão de projeto (doc 02 §3)");
r = await U.A7.c("GET", "/api/projeto"); check("sem equipe: projeto null", r.status === 200 && r.json.projeto === null, r);
r = await U.A7.c("POST", "/api/projeto", { nome: "x", descricao: "y" }); check("sem equipe não submete: 403", r.status === 403, r);
r = await U.E1.c("POST", "/api/projeto", { nome: "P3", descricao: "d", enviar: true }); check("equipe abaixo do mínimo não envia: 400", r.status === 400, r);
r = await U.E1.c("POST", "/api/projeto", { nome: "P3", descricao: "d" }); check("rascunho permitido abaixo do mínimo", r.status === 201 && r.json.projeto.situacao === "RASCUNHO", r);
r = await U.A2.c("POST", "/api/projeto", { nome: "P1", descricao: "d", desafioId: D2 }); check("desafio não publicado: 400", r.status === 400, r);
r = await U.A2.c("POST", "/api/projeto", { nome: "P1", descricao: "d", links: [{ tipo: "repo", url: "não é url" }] }); check("link inválido: 400", r.status === 400, r);
r = await U.A2.c("POST", "/api/projeto", {
  nome: "P1", descricao: "Projeto 1", solucao: "Sol", desafioId: D1, tecnologias: ["Next.js", "Prisma"],
  links: [{ tipo: "repositorio", url: "https://github.com/x/p1" }], arquivos: [{ nome: "pitch.pdf", url: "https://drive.x/p1" }], enviar: true,
});
check("T1 envia com desafio publicado; listas em Json", r.status === 201 && r.json.projeto.situacao === "ENVIADO" && r.json.projeto.enviadoEm && r.json.projeto.tecnologias.length === 2 && r.json.projeto.links[0].url, r);
const P1 = r.json.projeto.id; const envioP1 = r.json.projeto.enviadoEm;
r = await U.A4.c("PUT", "/api/projeto", { solucao: "Editado por outro membro", enviar: true }); check("qualquer membro da equipe edita; 1º envio preservado", r.json?.projeto?.solucao === "Editado por outro membro" && r.json.projeto.enviadoEm === envioP1, r);
r = await U.A2.c("POST", "/api/projeto", { nome: "P1b", descricao: "d" }); check("um projeto por equipe: 409", r.status === 409, r);
await new Promise((ok) => setTimeout(ok, 50));
r = await U.A5.c("POST", "/api/projeto", { nome: "P2", descricao: "Projeto 2", enviar: true }); const P2 = r.json?.projeto?.id; check("T2 envia depois de T1", r.status === 201, r);
r = await U.A1.c("GET", "/api/projeto"); check("ex-membro não vê projeto da antiga equipe", r.json?.projeto === null, r);
r = await adm("GET", "/api/admin/projetos");
const projetoAdmin = r.json?.projetos?.find((p) => p.id === P1);
check("admin lista projetos com situação e todos os detalhes", r.json?.projetos?.length === 3
  && projetoAdmin?.descricao === "Projeto 1"
  && projetoAdmin?.solucao === "Editado por outro membro"
  && projetoAdmin?.arquivos?.[0]?.nome === "pitch.pdf", r);

// ---------------------------------------------------------------- 9
titulo("9. Jurados e atribuições (doc 02 §4/§5; jurado = User com papel JURADO)");
r = await adm("POST", "/api/admin/jurados", { userId: U.A2.id }); check("participante em equipe não vira jurado: 400", r.status === 400, r);
for (const k of ["E2", "A7", "A8"]) {
  r = await adm("POST", "/api/admin/jurados", { userId: U[k].id });
}
check("autoriza 3 jurados", r.status === 201 && r.json.jurado.papel === "JURADO", r);
r = await U.A7.c("GET", "/api/auth/me"); check("papel reflete na sessão existente", r.json?.user?.papel === "JURADO", r);
r = await U.A7.c("POST", "/api/equipe", { nome: `TJ ${s}` }); check("jurado não integra equipe: 403", r.status === 403, r);
r = await adm("GET", "/api/admin/jurados"); check("admin lista jurados", r.json?.jurados?.length === 3, r);
r = await adm("POST", "/api/admin/atribuicoes/distribuir"); check("distribuição automática: 2 jurados × 2 projetos enviados", r.json?.criadas === 4, r);
r = await adm("POST", "/api/admin/atribuicoes/distribuir"); check("redistribuir não duplica", r.json?.criadas === 0, r);
r = await adm("GET", "/api/admin/projetos");
const porProj = Object.fromEntries(r.json.projetos.map((p) => [p.nome, p.atribuicoes.length]));
check("P1 e P2 com 2 jurados, rascunho sem jurados", porProj.P1 === 2 && porProj.P2 === 2 && porProj.P3 === 0, porProj);
const jurados = ["E2", "A7", "A8"];
const semP1 = jurados.find((k) => !r.json.projetos.find((p) => p.id === P1).atribuicoes.some((a) => a.juradoId === U[k].id));
r = await adm("POST", `/api/admin/jurados/${U[semP1].id}/atribuicoes`, { projetoIds: [P1] }); check("atribuição manual (P1 com 3 jurados)", r.json?.criadas === 1, r);
r = await adm("POST", `/api/admin/jurados/${U.A2.id}/atribuicoes`, { projetoIds: [P1] }); check("atribuir a não-jurado: 400", r.status === 400, r);
r = await adm("GET", "/api/admin/projetos"); const proj = Object.fromEntries(r.json.projetos.map((p) => [p.id, p]));
const juradosDe = (pid) => proj[pid].atribuicoes.map((a) => jurados.find((k) => U[k].id === a.juradoId));
const semP2 = jurados.find((k) => !juradosDe(P2).includes(k));
r = await U[semP2].c("GET", `/api/jurado/avaliacao/${P2}`); check("jurado sem atribuição não acessa o projeto: 404", r.status === 404, r);
r = await U.A2.c("GET", "/api/jurado/projetos"); check("participante na área do jurado: 403", r.status === 403, r);
r = await U[juradosDe(P1)[0]].c("GET", "/api/jurado/projetos"); check("jurado lista projetos com status pendente", r.json?.projetos?.some((p) => p.id === P1 && p.status === "PENDENTE"), r);
r = await U[juradosDe(P1)[0]].c("GET", `/api/jurado/avaliacao/${P1}`);
check("jurado vê projeto + equipe + critérios + escala", r.json?.equipe?.integrantes?.length === 3 && r.json.criterios.length === 3 && r.json.escala.notaMax === 10 && r.json.desafio?.id === D1, r);

// ---------------------------------------------------------------- 10
titulo("10. Avaliação (doc 02 §4) com empate decidido pelo critério prioritário");
const notas = (a, b, c) => [{ criterioId: crit.Inovação, nota: a }, { criterioId: crit.Técnica, nota: b }, { criterioId: crit.Impacto, nota: c }];
const [j1, j2, j3] = juradosDe(P1);
r = await U[j1].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(11, 5, 5) }); check("nota acima da escala: 400", r.status === 400, r);
r = await U[j1].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(-1, 5, 5) }); check("nota abaixo da escala: 400", r.status === 400, r);
r = await U[j1].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(5, 5, 5).slice(0, 2) }); check("critério faltando: 400", r.status === 400, r);
// P1: Inovação média 6, Técnica 10, Impacto 10 → (18+10+10)/5 = 7.6
r = await U[j1].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(5, 10, 10), comentario: "Bom" }); check("J1 avalia P1", r.status === 200, r);
r = await U[j1].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(9, 9, 9) }); check("reenvio bloqueado (permitirEdicaoAvaliacao=false): 409", r.status === 409, r);
await U[j2].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(7, 10, 10) });
r = await adm("GET", "/api/admin/avaliacoes"); check("acompanhamento: pendentes/concluídas", r.json?.total === 5 && r.json.concluidas === 2, r);
r = await adm("PUT", `/api/admin/hackathons/${H}`, { notaMax: 5 }); check("escala travada após avaliações: 409", r.status === 409, r);
r = await adm("GET", "/api/admin/resultados");
check("prévia com avaliação pendente marca incompleto (2/3 jurados)", r.json?.ranking?.find((l) => l.projetoId === P1)?.jurados === 2, r);
await U[j3].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(6, 10, 10) });
// P2: Inovação 8, Técnica 7, Impacto 7 → (24+7+7)/5 = 7.6 (empate; P2 vence por Inovação)
const [k1, k2] = juradosDe(P2);
await U[k1].c("POST", `/api/jurado/avaliacao/${P2}`, { notas: notas(8, 6, 7) });
r = await U[k2].c("POST", `/api/jurado/avaliacao/${P2}`, { notas: notas(8, 8, 7) }); check("jurados de P2 avaliam", r.status === 200, r);
r = await U[k2].c("GET", "/api/jurado/projetos"); check("status CONCLUIDA para o jurado", r.json?.projetos?.find((p) => p.id === P2)?.status === "CONCLUIDA", r);

// ---------------------------------------------------------------- 11
titulo("11. Apuração e publicação (doc 02 §5 Resultados, §6)");
r = await adm("GET", "/api/admin/resultados");
const lin = Object.fromEntries(r.json.ranking.map((l) => [l.projetoId, l]));
check("nota final ponderada P1 = 7.6", lin[P1]?.notaFinal === 7.6, lin[P1]);
check("nota final ponderada P2 = 7.6", lin[P2]?.notaFinal === 7.6, lin[P2]);
check("desempate por Inovação: P2 em 1º, P1 em 2º", lin[P2]?.posicao === 1 && lin[P1]?.posicao === 2, r.json.ranking);
check("rascunho fora do ranking", !lin[r.json.ranking.find((l) => l.projeto.nome === "P3")?.projetoId], r.json.ranking);
r = await pub("GET", "/api/resultados"); check("antes da publicação: nada público", r.json?.publicado === false && r.json.ranking.length === 0, r);
r = await adm("POST", "/api/admin/resultados/publicar", {}); check("publica manualmente", r.json?.hackathon?.resultadosPublicados === true, r);
r = await pub("GET", "/api/resultados"); check("público: ranking com equipes e projetos, sem notas", r.json?.publicado && r.json.ranking[0].projeto.id === P2 && r.json.ranking[0].equipe.nome && r.json.ranking[0].notaFinal === undefined, r);
await adm("PUT", `/api/admin/hackathons/${H}`, { exibirNotasPublicas: true });
r = await pub("GET", "/api/resultados"); check("com exibirNotasPublicas: notas e critérios visíveis", r.json?.ranking?.[0]?.notaFinal === 7.6 && r.json.criterios.length === 3, r);
r = await U[semP2].c("POST", `/api/jurado/avaliacao/${P2}`, { notas: notas(1, 1, 1) }); check("sem atribuição não avalia: 404", r.status === 404, r);
r = await adm("PUT", `/api/admin/projetos/${P2}`, { situacao: "DESCLASSIFICADO" }); check("não altera projeto com resultado publicado: 409", r.status === 409, r);
await adm("POST", "/api/admin/resultados/publicar", { publicado: false });
r = await pub("GET", "/api/resultados"); check("despublicar oculta de novo", r.json?.publicado === false, r);
r = await adm("PUT", `/api/admin/projetos/${P2}`, { situacao: "DESCLASSIFICADO" }); check("desclassifica P2", r.json?.projeto?.situacao === "DESCLASSIFICADO", r);
r = await adm("GET", "/api/admin/resultados"); check("P1 assume o 1º lugar sem P2", r.json?.ranking?.length === 1 && r.json.ranking[0].projetoId === P1 && r.json.ranking[0].posicao === 1, r);
r = await adm("PUT", `/api/admin/projetos/${P2}`, { situacao: "ATIVO" }); check("reativa P2 (volta a ENVIADO)", r.json?.projeto?.situacao === "ENVIADO", r);

// ---------------------------------------------------------------- 12
titulo("12. Dashboard e admin de usuários/equipes (doc 01 §5, doc 02 §5)");
r = await adm("GET", "/api/admin/dashboard");
check("dashboard: inscrições, equipes, participantes, projetos, jurados, pendentes, agenda e comunicados",
  r.json?.equipes?.total === 4 && r.json.participantesEmEquipes === 7 && r.json.projetos.total === 3
  && r.json.jurados === 3 && r.json.avaliacoes.pendentes === 0 && r.json.proximaAgenda[0]?.titulo === "Abertura"
  && r.json.comunicadosRecentes?.some((c) => c.titulo === "Publicado" && c.publicadoEm)
  && r.json.comunicadosRecentes?.some((c) => c.titulo === "Rascunho" && !c.publicadoEm), r.json);
r = await adm("GET", "/api/admin/usuarios?papel=JURADO"); check("filtro por papel", r.json?.total === 3, r);
r = await pub("GET", "/api/equipes"); check("lista pública de equipes desligada por padrão", r.json?.publico === false && r.json.equipes.length === 0, r);
await adm("PUT", `/api/admin/hackathons/${H}`, { exibirEquipesPublicas: true, local: "IFPR Campus Pinhais — Bloco B" });
r = await pub("GET", "/api/equipes");
check("com a flag: equipes inscritas públicas, sem dados de pessoas",
  r.json?.publico === true && r.json.equipes.some((e) => e.nome === `T1 ${s}` && e.integrantes === 3) && !JSON.stringify(r.json).includes("@") && !JSON.stringify(r.json).includes("Aluno"), r);
r = await pub("GET", "/api/hackathon/atual"); check("local da edição público (planejamento p.1)", r.json?.hackathon?.local === "IFPR Campus Pinhais — Bloco B", r);
r = await adm("GET", "/api/admin/usuarios?vinculo=SERVIDOR"); check("filtro por vínculo", r.json?.usuarios?.some((u) => u.id === U.S1.id), r);
r = await adm("GET", `/api/admin/usuarios?q=ALUNO%20UM`); check("busca por nome sem diferenciar maiúsculas", r.json?.total === 1, r);
r = await adm("GET", "/api/admin/usuarios?pageSize=2&page=2"); check("paginação", r.json?.usuarios?.length === 2 && r.json.page === 2, r);
r = await adm("PUT", `/api/admin/usuarios/${U.A7.id}/situacao`, { situacao: "BLOQUEADO" }); check("bloqueia usuário", r.json?.user?.situacao === "BLOQUEADO", r);
r = await U.A7.c("GET", "/api/jurado/projetos"); check("sessão de bloqueado deixa de valer: 401", r.status === 401, r);
r = await cliente()("POST", "/api/auth/login", { identificador: U.A7.email, senha: "Senha@123" }); check("bloqueado não loga: 403", r.status === 403, r);
await adm("PUT", `/api/admin/usuarios/${U.A7.id}/situacao`, { situacao: "ATIVO" });
r = await adm("PUT", `/api/admin/usuarios/${U.A7.id}/papel`, { papel: "PARTICIPANTE" }); check("admin altera papel", r.json?.user?.papel === "PARTICIPANTE", r);
r = await adm("GET", "/api/admin/equipes"); check("equipes com integrantes, líder, situação e projeto", r.json?.equipes?.find((e) => e.id === T1)?.projeto?.id === P1 && r.json.equipes.find((e) => e.id === T1).lider, r);
r = await adm("PUT", `/api/admin/equipes/${T1}`, { liderId: null }); check("admin não deixa equipe com membros sem líder: 400", r.status === 400, r);
r = await adm("PUT", `/api/admin/equipes/${T1}`, { liderId: U.A3.id }); check("admin corrige líder", r.json?.equipe?.liderId === U.A3.id, r);
r = await adm("PUT", `/api/admin/equipes/${T3}`, { situacao: "DESCLASSIFICADA" }); check("admin desclassifica equipe", r.json?.equipe?.situacao === "DESCLASSIFICADA", r);
r = await U.E1.c("PUT", "/api/projeto", { nome: "P3 editado" }); check("equipe desclassificada não edita projeto: 403", r.status === 403, r);
r = await adm("PUT", `/api/admin/equipes/${T3}`, { situacao: "EM_FORMACAO" }); check("reverte desclassificação", r.json?.equipe?.situacao === "EM_FORMACAO", r);
r = await adm("DELETE", `/api/equipe/membro/${U.S1.id}`); check("admin remove membro de qualquer equipe", r.json?.equipe?.membros?.length === 2, r);

// ---------------------------------------------------------------- 13
titulo("13. Prazos e janelas configuráveis");
await adm("PUT", `/api/admin/hackathons/${H}`, { inscricaoInicio: dias(-3), inscricaoFim: dias(-1) });
r = await U.A1.c("POST", "/api/equipe", { nome: `Tarde ${s}` }); check("inscrições encerradas: não cria equipe", r.status === 400, r);
r = await U.A1.c("POST", "/api/equipe/entrar", { codigo: cod2 }); check("inscrições encerradas: não entra em equipe", r.status === 400, r);
await adm("PUT", `/api/admin/hackathons/${H}`, { status: "EM_ANDAMENTO", prazoSubmissao: dias(-0.01) });
r = await U.A2.c("PUT", "/api/projeto", { nome: "P1 fora do prazo" }); check("prazo de submissão vencido: 400", r.status === 400, r);
await adm("PUT", `/api/admin/hackathons/${H}`, { prazoSubmissao: null });
r = await U.A2.c("PUT", "/api/projeto", { nome: "P1 no prazo" }); check("sem prazo explícito usa dataFim", r.status === 200, r);
await adm("PUT", `/api/admin/hackathons/${H}`, { status: "ENCERRADO" });
r = await U.A2.c("PUT", "/api/projeto", { nome: "P1 encerrado" }); check("edição encerrada: 400", r.status === 400, r);
r = await pub("GET", "/api/hackathon/atual"); check("edição encerrada continua pública", r.json?.hackathon?.status === "ENCERRADO" && !r.json.hackathon.submissaoAberta, r);

// ---------------------------------------------------------------- 14
titulo("14. Sessão");
r = await U.A2.c("POST", "/api/auth/logout"); r = await U.A2.c("GET", "/api/perfil"); check("logout encerra a sessão", r.status === 401, r);
r = await fetch(BASE + "/api/perfil", { headers: { cookie: "hackif_session=forjado.invalido.token" } }); check("cookie forjado: 401", r.status === 401, r.status);
r = await fetch(BASE + "/api/auth/logout", { method: "POST", headers: { origin: "https://site-malicioso.example" } }); check("requisição que altera dados vinda de outro site: 403", r.status === 403, r.status);
r = await fetch(BASE + "/api/auth/logout", { method: "POST", headers: { origin: BASE } }); check("mesma origem passa", r.status === 200, r.status);

// ---------------------------------------------------------------- 15
titulo("15. Apuração rastreável (canvas: registro de quem lançou o quê)");
r = await adm("GET", `/api/admin/projetos/${P1}/registros`);
check("cada nota lançada gera registro (3 jurados × 3 critérios)", r.json?.registros?.length === 9 && r.json.registros.every((x) => x.notaAnterior === null && x.jurado.nome && x.criterio.nome), r.json?.registros?.length);
await adm("PUT", `/api/admin/hackathons/${H}`, { permitirEdicaoAvaliacao: true });
// A7 foi rebaixado a participante na seção 12: usa um jurado de P1 que continua ativo.
const inovacaoDada = { [j1]: 5, [j2]: 7, [j3]: 6 };
const jAud = [j1, j2, j3].find((k) => k !== "A7");
r = await U[jAud].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(inovacaoDada[jAud], 9, 10), ...(jAud === j1 && { comentario: "Bom" }) }); check("jurado altera uma nota (edição permitida)", r.status === 200, r);
r = await adm("GET", `/api/admin/projetos/${P1}/registros`);
const alteracao = r.json?.registros?.[9];
check("alteração registrada com valor anterior e novo", r.json?.registros?.length === 10 && alteracao?.notaAnterior === 10 && alteracao.notaNova === 9 && alteracao.criterio.nome === "Técnica", alteracao);
r = await U[jAud].c("POST", `/api/jurado/avaliacao/${P1}`, { notas: notas(inovacaoDada[jAud], 9, 10), ...(jAud === j1 && { comentario: "Bom" }) });
r = await adm("GET", `/api/admin/projetos/${P1}/registros`); check("reenvio sem mudança não gera registro", r.json?.registros?.length === 10, r.json?.registros?.length);
const correcao = { projetoId: P1, juradoId: U[jAud].id, criterioId: crit.Impacto };
r = await adm("POST", "/api/admin/avaliacoes/corrigir", { ...correcao, nota: 8, justificativa: "curta" }); check("correção exige justificativa: 400", r.status === 400, r);
r = await adm("POST", "/api/admin/avaliacoes/corrigir", { ...correcao, nota: 11, justificativa: "Ficha em papel conferida com o jurado" }); check("correção respeita a escala: 400", r.status === 400, r);
r = await U.A3.c("POST", "/api/admin/avaliacoes/corrigir", { ...correcao, nota: 8, justificativa: "Tentativa de participante" }); check("participante não corrige nota: 403", r.status === 403, r);
r = await adm("POST", "/api/admin/avaliacoes/corrigir", { ...correcao, nota: 8, justificativa: "Nota digitada errado, conferida com o jurado" });
check("comissão corrige nota (canvas: quem altera nota já lançada)", r.status === 200 && r.json.avaliacao.nota === 8 && r.json.registro.notaAnterior === 10, r);
r = await adm("GET", `/api/admin/projetos/${P1}/registros`);
const ultimo = r.json?.registros?.at(-1);
check("correção registrada com quem corrigiu e justificativa", r.json?.registros?.length === 11 && ultimo?.tipo === "CORRECAO_COMISSAO" && ultimo.alteradoPor?.nome && /Correção pela comissão .*conferida com o jurado/.test(ultimo.comentario), ultimo);
r = await adm("POST", "/api/admin/avaliacoes/corrigir", { ...correcao, nota: 8, justificativa: "Nota digitada errado, conferida com o jurado" }); check("correção para o mesmo valor: 400", r.status === 400, r);
r = await U.A3.c("GET", `/api/admin/projetos/${P1}/registros`); check("participante não vê a trilha: 403", r.status === 403, r);

titulo("16. Páginas do planejamento (31 telas) e rotas antigas");
const home = await fetch(BASE + "/");
const homeHtml = await home.text();
check("Home usa edição, desafio, agenda e resultado publicados", home.status === 200
  && homeHtml.includes(`HackIF Fluxo ${s}`)
  && homeHtml.includes("Desafio publicado")
  && homeHtml.includes("Abertura")
  && homeHtml.includes("Projeto 1"), { status: home.status });
const paginasPublicas = ["/", "/hackathon", "/desafios", "/agenda", "/resultados", "/regulamento", "/privacidade", "/login", "/login/aluno", "/login/servidor", "/login/externo", "/cadastro/aluno", "/cadastro/servidor", "/cadastro/externo", "/recuperar-senha", "/sobre"];
const publicasOk = [];
for (const p of paginasPublicas) if ((await fetch(BASE + p, { redirect: "manual" })).status === 200) publicasOk.push(p);
check(`${paginasPublicas.length} páginas públicas respondem 200`, publicasOk.length === paginasPublicas.length, paginasPublicas.filter((p) => !publicasOk.includes(p)));
const protegidas = ["/dashboard", "/perfil", "/equipe", "/equipe/criar", "/equipe/gerenciar", "/projeto", "/jurado", "/admin", "/admin/hackathons", "/admin/desafios", "/admin/usuarios", "/admin/equipes", "/admin/projetos", "/admin/jurados", "/admin/criterios", "/admin/agenda", "/admin/avaliacoes", "/admin/resultados", "/admin/comunicados"];
const semLogin = [];
for (const p of protegidas) {
  const res = await fetch(BASE + p, { redirect: "manual" });
  if (!(res.status >= 300 && res.status < 400 && (res.headers.get("location") ?? "").includes("/login"))) semLogin.push(`${p}=${res.status}`);
}
check(`${protegidas.length} páginas protegidas levam ao /login sem sessão`, semLogin.length === 0, semLogin);
const antigas = { "/entrar": "/login", "/conta": "/perfil", "/participante/equipe": "/equipe", "/participante/projeto": "/projeto", "/admin/edicoes": "/admin/hackathons", "/cadastro": "/cadastro/aluno" };
const redirOk = [];
for (const [de, para] of Object.entries(antigas)) {
  const res = await fetch(BASE + de, { redirect: "manual" });
  if (res.status >= 300 && res.status < 400 && new URL(res.headers.get("location"), BASE).pathname === para) redirOk.push(de);
}
check("rotas antigas redirecionam para as do planejamento", redirOk.length === Object.keys(antigas).length, Object.keys(antigas).filter((k) => !redirOk.includes(k)));

titulo("17. Exclusão de conta — LGPD (doc 01 §6)");
r = await U.A6.c("DELETE", "/api/perfil", { senha: "errada" }); check("exclusão exige a senha: 400", r.status === 400, r);
r = await U.A6.c("DELETE", "/api/perfil", { senha: "Senha@123" }); check("titular exclui a própria conta", r.status === 200, r);
r = await U.A6.c("GET", "/api/perfil"); check("sessão encerrada após exclusão", r.status === 401, r);
r = await cliente()("POST", "/api/auth/login", { identificador: U.A6.email, senha: "Senha@123" }); check("conta excluída não loga", r.status === 401, r);
r = await adm("GET", "/api/admin/usuarios?situacao=BLOQUEADO&pageSize=100");
const anon = r.json?.usuarios?.find((u) => u.id === U.A6.id);
check("dados pessoais apagados (nome, e-mail, matrícula)", anon && anon.nome === "Conta removida" && !anon.email.includes(s) && anon.matricula === null && anon.anonimizadoEm, anon);
r = await adm("GET", "/api/admin/equipes?pageSize=100");
check("saiu da equipe; histórico da equipe preservado", r.json?.equipes?.some((e) => e.nome === `T2 ${s}`) && !r.json.equipes.some((e) => e.membros.some((m) => m.user.id === U.A6.id)), r.json?.equipes?.map((e) => e.nome));
r = await adm("PUT", `/api/admin/usuarios/${U.A6.id}/situacao`, { situacao: "ATIVO" }); check("conta anonimizada não é reativada: 400", r.status === 400, r);
r = await adm("PUT", `/api/admin/usuarios/${U.A6.id}/papel`, { papel: "JURADO" }); check("conta anonimizada não recebe papel: 400", r.status === 400, r);
r = await cliente()("POST", "/api/auth/register/aluno", { nome: "Aluno 6 de volta", email: U.A6.email, matricula: U.A6.matricula, curso: "CC", senha: "Senha@123", aceiteTermos: true });
check("e-mail e matrícula liberados para novo cadastro", r.status === 201, r);
r = await adm("DELETE", "/api/perfil", { senha: ADMIN.senha }); check("último administrador não pode excluir a conta: 400", r.status === 400, r);

titulo("18. Operação do evento (canvas): convite de jurado, presença, relatório e descarte LGPD");
r = await adm("POST", "/api/admin/jurados/convidar", { nome: "Jurada Convidada", email: `conv.${s}@parceiro.dev` });
check("comissão cadastra jurado externo e recebe link de senha (7 dias)", r.status === 201 && r.json.jurado.papel === "JURADO" && /\/redefinir-senha\?token=/.test(r.json.linkDefinirSenha), r);
const tokenConvite = new URL(r.json.linkDefinirSenha).searchParams.get("token");
r = await adm("POST", "/api/admin/jurados/convidar", { nome: "Dup", email: `conv.${s}@parceiro.dev` }); check("convite duplicado: 409", r.status === 409, r);
r = await adm("POST", "/api/admin/jurados/convidar", { nome: "Participante", email: U.A3.email }); check("e-mail de conta existente: 409 (autorizar em vez de convidar)", r.status === 409, r);
r = await pub("POST", "/api/auth/redefinir-senha", { token: tokenConvite, novaSenha: "Jurada@2026" }); check("jurado define a senha pelo link", r.status === 200, r);
r = await cliente()("POST", "/api/auth/login", { identificador: `conv.${s}@parceiro.dev`, senha: "Jurada@2026" }); check("jurado convidado entra com papel JURADO", r.status === 200 && r.json.user.papel === "JURADO", r);

r = await adm("GET", "/api/admin/presencas"); const inscritosAgora = r.json?.participantes?.filter((p) => p.equipe.situacao === "INSCRITA") ?? [];
check("lista de presença traz participantes com equipe", r.status === 200 && r.json.participantes.some((p) => p.id === U.A2.id && !p.presente), r.json?.total);
r = await adm("POST", "/api/admin/presencas", { userId: U.A2.id, presente: true }); check("marca presença", r.json?.presente === true, r);
r = await adm("POST", "/api/admin/presencas", { userId: U.A2.id, presente: true }); check("marcar de novo não duplica", r.status === 200, r);
r = await adm("POST", "/api/admin/presencas", { userId: U.A1.id, presente: true }); check("sem equipe na edição não recebe presença: 400", r.status === 400, r);
r = await U.A3.c("GET", "/api/admin/presencas"); check("participante não vê presença: 403", r.status === 403, r);
r = await adm("GET", "/api/admin/relatorio");
const esperadosPresentes = inscritosAgora.some((p) => p.id === U.A2.id) ? 1 : 0;
check("relatório: inscritos, presentes e taxa (canvas: prestação de contas)",
  r.json?.participantes?.inscritos === inscritosAgora.length && r.json.participantes.presentes === esperadosPresentes && r.json.comunicacao.mudancasDeAgendaComunicadas === 4 && r.json.avaliacao.atribuicoes === 5, r.json);
let csvRes = await fetch(BASE + "/api/admin/relatorio/participantes", { headers: { cookie: adm.cookie() } });
// text() descarta o BOM ao decodificar: confere os bytes crus.
const bytes = new Uint8Array(await csvRes.arrayBuffer());
let csv = new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes);
check("CSV de participantes para Excel (BOM, ; e dados da equipe)",
  csvRes.status === 200 && /text\/csv/.test(csvRes.headers.get("content-type")) && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf &&
  csv.startsWith("﻿nome;email;vinculo") && csv.includes(U.A2.email) && csv.includes(";sim"), csv.slice(0, 200));
csvRes = await fetch(BASE + "/api/admin/relatorio/resultado", { headers: { cookie: adm.cookie() } });
csv = await csvRes.text();
check("CSV de resultado com posição, nota final e médias por critério", csvRes.status === 200 && csv.split("\r\n").length === 3 && /posicao;projeto;equipe;nota_final;jurados;media_Inovação/.test(csv), csv.slice(0, 200));
csvRes = await fetch(BASE + "/api/admin/relatorio/participantes");
check("CSV sem sessão de admin: 401", csvRes.status === 401, csvRes.status);
r = await adm("GET", "/api/admin/relatorio/csv-inexistente"); check("tipo de relatório inexistente: 404", r.status === 404, r);

r = await adm("GET", "/api/admin/lgpd/descarte"); check("descarte bloqueado sem prazo definido", r.json?.liberado === false && /retenção de dados/.test(r.json.motivo), r.json);
await adm("PUT", `/api/admin/hackathons/${H}`, { retencaoDadosDias: 30 });
r = await adm("GET", "/api/admin/lgpd/descarte"); check("descarte bloqueado antes do prazo vencer", r.json?.liberado === false && /não venceu/.test(r.json.motivo), r.json);
await adm("PUT", `/api/admin/hackathons/${H}`, { retencaoDadosDias: 0, dataInicio: dias(-3), dataFim: dias(-2) });
r = await adm("GET", "/api/admin/lgpd/descarte");
const elegiveis = r.json?.contas ?? [];
check("prévia lista participantes e jurados da edição, nunca administradores", r.json?.liberado === true && elegiveis.some((c) => c.id === U.A2.id) && elegiveis.some((c) => c.papel === "JURADO") && !elegiveis.some((c) => c.papel === "ADMIN"), r.json);
check("quem não participou da edição não entra no descarte", !elegiveis.some((c) => c.nome === "Jurada Convidada" || c.nome === "Aluno 6 de volta"), elegiveis.map((c) => c.nome));
r = await adm("POST", "/api/admin/lgpd/descarte", {}); check("descarte exige confirmação explícita: 400", r.status === 400, r);
r = await adm("POST", "/api/admin/lgpd/descarte", { confirmar: true }); check("descarte anonimiza as contas elegíveis", r.json?.anonimizadas === elegiveis.length && elegiveis.length > 0, r.json);
r = await cliente()("POST", "/api/auth/login", { identificador: U.A2.email, senha: "Senha@123" }); check("conta descartada não entra mais", r.status === 401, r);
r = await adm("GET", "/api/admin/lgpd/descarte"); check("após o descarte não restam contas elegíveis", r.json?.total === 0, r.json?.total);
r = await adm("GET", "/api/admin/dashboard"); check("administrador segue ativo após o descarte", r.status === 200, r);

console.log(`\n${total - falhas}/${total} verificações passaram${falhas ? ` — ${falhas} FALHA(S)` : ""}`);
process.exit(falhas ? 1 : 0);
