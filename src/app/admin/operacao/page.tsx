"use client";

import Link from "next/link";
import { useState } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Badge, Button, Checkbox, Field, formatarData, Input, Loading, PageHeader, Panel, Select, Textarea } from "@/src/components/ui/app";

type Retorno = { ok?: string; erro?: unknown; extra?: React.ReactNode } | null;

function Mensagem({ r }: { r: Retorno }) {
  if (r?.ok) return <div className="grid gap-2"><Alert tone="ok" title={r.ok} />{r.extra}</div>;
  if (r?.erro) return <Alert title={(r.erro as Error).message} lines={detalhesDoErro(r.erro)} />;
  return null;
}

type Edicao = {
  id: string;
  nome: string;
  status: string;
  limiteEquipes: number | null;
  comunicarMudancasAgenda: boolean;
  retencaoDadosDias: number | null;
};

/** Configurações operacionais que vieram do canvas (lista de espera, comunicação da agenda, retenção LGPD). */
function Configuracoes({ edicao, aoSalvar }: { edicao: Edicao; aoSalvar: () => void }) {
  const [limite, setLimite] = useState(edicao.limiteEquipes?.toString() ?? "");
  const [comunicar, setComunicar] = useState(edicao.comunicarMudancasAgenda);
  const [retencao, setRetencao] = useState(edicao.retencaoDadosDias?.toString() ?? "");
  const [r, setR] = useState<Retorno>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setR(null);
    try {
      await api(`/api/admin/hackathons/${edicao.id}`, {
        method: "PUT",
        body: {
          limiteEquipes: limite ? Number(limite) : null,
          comunicarMudancasAgenda: comunicar,
          retencaoDadosDias: retencao ? Number(retencao) : null,
        },
      });
      setR({ ok: "Configurações salvas" });
      aoSalvar();
    } catch (err) {
      setR({ erro: err });
    }
  }

  return (
    <Panel title={`Configurações · ${edicao.nome}`}>
      <form onSubmit={salvar} className="grid gap-4">
        <Field label="Limite de equipes inscritas" hint="Vazio = sem limite. Equipes completas além do limite entram na lista de espera, na ordem em que completaram.">
          <Input type="number" min={1} value={limite} onChange={(e) => setLimite(e.target.value)} placeholder="Ex.: 25" />
        </Field>
        <Checkbox label="Publicar comunicado automático quando a agenda mudar" checked={comunicar} onChange={(e) => setComunicar(e.target.checked)} />
        <Field label="Retenção de dados pessoais (dias após o fim)" hint="Vazio = prazo ainda não definido pela comissão. O descarte nunca é automático.">
          <Input type="number" min={0} value={retencao} onChange={(e) => setRetencao(e.target.value)} placeholder="Ex.: 180" />
        </Field>
        <Mensagem r={r} />
        <div><Button type="submit">Salvar configurações</Button></div>
      </form>
    </Panel>
  );
}

function ConvidarJurado() {
  const [form, setForm] = useState({ nome: "", email: "", vinculo: "EXTERNO" });
  const [r, setR] = useState<Retorno>(null);

  async function convidar(e: React.FormEvent) {
    e.preventDefault();
    setR(null);
    try {
      const res = await api<{ linkDefinirSenha: string; expiraEmDias: number }>("/api/admin/jurados/convidar", { method: "POST", body: form });
      setR({
        ok: `Jurado cadastrado. Envie o link abaixo (vale ${res.expiraEmDias} dias) para ele definir a senha.`,
        extra: <Input readOnly value={res.linkDefinirSenha} onFocus={(e) => e.currentTarget.select()} aria-label="Link para definir senha" />,
      });
      setForm({ nome: "", email: "", vinculo: "EXTERNO" });
    } catch (err) {
      setR({ erro: err });
    }
  }

  return (
    <Panel title="Convidar jurado">
      <form onSubmit={convidar} className="grid gap-4">
        <p className="text-[0.88rem] text-muted">Para jurados sem conta (externos, parceiros). Quem já tem conta é autorizado em Jurados.</p>
        <Field label="Nome"><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
        <Field label="E-mail"><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Vínculo">
          <Select value={form.vinculo} onChange={(e) => setForm({ ...form, vinculo: e.target.value })}>
            <option value="EXTERNO">Externo / convidado</option>
            <option value="EGRESSO">Egresso</option>
            <option value="SERVIDOR">Servidor</option>
          </Select>
        </Field>
        <Mensagem r={r} />
        <div><Button type="submit">Cadastrar e gerar link</Button></div>
      </form>
    </Panel>
  );
}

type Projeto = { id: string; nome: string; team: { nome: string }; atribuicoes: { juradoId: string; jurado: { nome: string } }[] };
type Criterio = { id: string; nome: string };

function CorrigirNota() {
  const { url } = useHackathon();
  const projetos = useApi<{ projetos: Projeto[] }>(url("/api/admin/projetos?situacao=ENVIADO"));
  const criterios = useApi<{ criterios: Criterio[] }>(url("/api/admin/criterios"));
  const [form, setForm] = useState({ projetoId: "", juradoId: "", criterioId: "", nota: "", justificativa: "" });
  const [r, setR] = useState<Retorno>(null);
  const projeto = projetos.data?.projetos.find((p) => p.id === form.projetoId);

  async function corrigir(e: React.FormEvent) {
    e.preventDefault();
    setR(null);
    try {
      await api("/api/admin/avaliacoes/corrigir", { method: "POST", body: { ...form, nota: Number(form.nota) } });
      setR({ ok: "Nota corrigida e registrada no histórico do projeto" });
      setForm({ ...form, nota: "", justificativa: "" });
    } catch (err) {
      setR({ erro: err });
    }
  }

  return (
    <Panel title="Corrigir nota de jurado">
      <form onSubmit={corrigir} className="grid gap-4">
        <p className="text-[0.88rem] text-muted">Só antes da publicação. A correção fica no histórico com seu nome, a nota anterior e a justificativa.</p>
        <Field label="Projeto">
          <Select required value={form.projetoId} onChange={(e) => setForm({ ...form, projetoId: e.target.value, juradoId: "" })}>
            <option value="">Selecione</option>
            {projetos.data?.projetos.map((p) => <option key={p.id} value={p.id}>{p.nome} · {p.team.nome}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Jurado">
            <Select required value={form.juradoId} onChange={(e) => setForm({ ...form, juradoId: e.target.value })}>
              <option value="">Selecione</option>
              {projeto?.atribuicoes.map((a) => <option key={a.juradoId} value={a.juradoId}>{a.jurado.nome}</option>)}
            </Select>
          </Field>
          <Field label="Critério">
            <Select required value={form.criterioId} onChange={(e) => setForm({ ...form, criterioId: e.target.value })}>
              <option value="">Selecione</option>
              {criterios.data?.criterios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Nova nota"><Input required type="number" step="any" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} /></Field>
        <Field label="Justificativa" hint="Mínimo de 10 caracteres">
          <Textarea required minLength={10} value={form.justificativa} onChange={(e) => setForm({ ...form, justificativa: e.target.value })} />
        </Field>
        <Mensagem r={r} />
        <div><Button type="submit">Corrigir nota</Button></div>
      </form>
    </Panel>
  );
}

type Previa = {
  hackathon: { nome: string; status: string; retencaoDadosDias: number | null };
  prazo: string | null;
  liberado: boolean;
  motivo: string | null;
  total: number;
  contas: { id: string; nome: string; papel: string }[];
};

function DescarteLgpd({ versao }: { versao: number }) {
  const { url, hackathonId } = useHackathon();
  const { data, reload } = useApi<Previa>(url(`/api/admin/lgpd/descarte?v=${versao}`));
  const [r, setR] = useState<Retorno>(null);

  async function executar() {
    if (!data || !confirm(`Anonimizar ${data.total} conta(s)? Nomes, e-mails e documentos serão apagados definitivamente.`)) return;
    setR(null);
    try {
      const res = await api<{ anonimizadas: number }>("/api/admin/lgpd/descarte", { method: "POST", body: { confirmar: true, ...(hackathonId && { hackathonId }) } });
      setR({ ok: `${res.anonimizadas} conta(s) anonimizada(s)` });
      reload();
    } catch (err) {
      setR({ erro: err });
    }
  }

  return (
    <Panel title="Descarte de dados (LGPD)" className="border-if-red/30">
      {!data ? <Loading /> : (
        <div className="grid gap-4">
          <p className="text-[0.88rem] text-muted">
            Anonimiza participantes e jurados da edição depois do prazo de retenção, desde que não participem de outra edição ainda dentro do prazo. Administradores não são afetados.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone={data.liberado ? "alerta" : "neutro"}>{data.liberado ? "descarte liberado" : "não liberado"}</Badge>
            <Badge>{data.hackathon.retencaoDadosDias == null ? "prazo não definido" : `${data.hackathon.retencaoDadosDias} dias`}</Badge>
            {data.prazo ? <Badge>a partir de {formatarData(data.prazo)}</Badge> : null}
          </div>
          {data.motivo ? <p className="text-[0.88rem]">{data.motivo}.</p> : null}
          {data.liberado ? <p className="text-[0.88rem]">{data.total} conta(s) elegível(is).</p> : null}
          <Mensagem r={r} />
          <div><Button variant="danger" disabled={!data.liberado || data.total === 0} onClick={executar}>Anonimizar contas elegíveis</Button></div>
        </div>
      )}
    </Panel>
  );
}

const atalho = "inline-flex h-10 items-center border border-foreground/20 px-4 text-[0.78rem] font-bold uppercase hover:border-accent hover:text-accent";

/** Operação do evento: recursos pedidos pelo canvas que não cabem nas telas do planejamento. */
export default function AdminOperacaoPage() {
  const { url } = useHackathon();
  const hackathons = useApi<{ hackathons: Edicao[] }>("/api/admin/hackathons");
  // O dashboard resolve a edição selecionada (ou a atual) — usado para saber qual edição configurar.
  const dashboard = useApi<{ hackathon: { id: string } }>(url("/api/admin/dashboard"));
  const [versao, setVersao] = useState(0);
  const edicao = hackathons.data?.hackathons.find((h) => h.id === dashboard.data?.hackathon.id) ?? null;

  return (
    <>
      <PageHeader
        tag="admin/operacao"
        title="Operação do evento"
        description="Lista de espera, comunicação automática da agenda, convite de jurados, correção de notas e descarte de dados."
        actions={
          <>
            <Link href="/admin/presenca" className={atalho}>Presença</Link>
            <Link href="/admin/relatorio" className={atalho}>Relatório</Link>
          </>
        }
      />
      {hackathons.loading && !hackathons.data ? <Loading /> : null}
      {dashboard.error ? <Alert title={dashboard.error.message} /> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        {edicao ? <Configuracoes key={edicao.id} edicao={edicao} aoSalvar={() => { hackathons.reload(); setVersao((v) => v + 1); }} /> : null}
        <ConvidarJurado />
        <CorrigirNota />
        <DescarteLgpd versao={versao} />
      </div>
    </>
  );
}
