"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/src/hooks/useApi";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Badge, Button, Field, formatarData, Input, Loading, PageHeader, Panel, Select, Textarea } from "@/src/components/ui/app";

type Membro = { user: { id: string; nome: string } };
type Equipe = { id: string; nome: string; situacao: string; liderId: string | null; codigoConvite: string | null; membros: Membro[] };
type Projeto = {
  id: string;
  nome: string;
  descricao: string;
  solucao: string | null;
  desafioId: string | null;
  tecnologias: string[];
  links: { tipo: string; url: string }[];
  arquivos: { nome: string; url: string }[];
  situacao: "RASCUNHO" | "ENVIADO" | "DESCLASSIFICADO";
  enviadoEm: string | null;
};
type Hackathon = { nome: string; limiteMinIntegrantes: number; limiteMaxIntegrantes: number; prazoSubmissao: string | null; dataFim: string; submissaoAberta: boolean };

// "tipo | url" por linha <-> [{ tipo, url }]
const paraLinhas = (itens: Record<string, string>[], chave: string) => itens.map((i) => `${i[chave]} | ${i.url}`).join("\n");
function deLinhas<K extends string>(texto: string, chave: K) {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [rotulo, ...resto] = l.split("|");
      const url = resto.join("|").trim();
      return (url ? { [chave]: rotulo.trim(), url } : { [chave]: "link", url: rotulo.trim() }) as Record<K, string> & { url: string };
    });
}

function EquipePanel({ equipe, hackathon, aoMudar }: { equipe: Equipe | null; hackathon: Hackathon | null; aoMudar: () => void }) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<unknown>(null);

  async function acao(fn: () => Promise<unknown>) {
    try {
      setErro(null);
      await fn();
      aoMudar();
    } catch (e) {
      setErro(e);
    }
  }

  if (equipe) {
    return (
      <Panel title={`Equipe ${equipe.nome}`} actions={<Badge tone={equipe.situacao === "INSCRITA" ? "ok" : "alerta"}>{equipe.situacao}</Badge>}>
        <ul className="grid gap-1 text-[0.9rem]">
          {equipe.membros.map((m) => (
            <li key={m.user.id}>{m.user.nome}{m.user.id === equipe.liderId ? <span className="ml-2 font-mono text-[0.7rem] text-accent">LÍDER</span> : null}</li>
          ))}
        </ul>
        <p className="mt-3 text-[0.8rem] text-muted">
          {equipe.membros.length} integrante(s) · limite {hackathon?.limiteMinIntegrantes}–{hackathon?.limiteMaxIntegrantes}
        </p>
        {equipe.codigoConvite ? (
          <p className="mt-3 text-[0.85rem]">Código de convite: <span className="font-mono font-semibold text-accent">{equipe.codigoConvite}</span></p>
        ) : null}
      </Panel>
    );
  }

  return (
    <Panel title="Você ainda não tem equipe">
      <div className="grid gap-5">
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); acao(() => api("/api/equipe", { method: "POST", body: { nome } })); }}>
          <Field label="Criar equipe"><Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da equipe" /></Field>
          <Button type="submit">Criar</Button>
        </form>
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); acao(() => api("/api/equipe/entrar", { method: "POST", body: { codigo } })); }}>
          <Field label="Entrar com código"><Input required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: HACKIF01" /></Field>
          <Button type="submit" variant="ghost">Entrar</Button>
        </form>
        {erro ? <Alert title={(erro as Error).message} /> : null}
      </div>
    </Panel>
  );
}

export default function ParticipanteProjetoPage() {
  const hackathon = useApi<{ hackathon: Hackathon }>("/api/hackathon/atual");
  const equipeReq = useApi<{ equipe: Equipe | null }>("/api/equipe");
  const projetoReq = useApi<{ projeto: Projeto | null }>("/api/projeto");
  const desafios = useApi<{ desafios: { id: string; titulo: string }[] }>("/api/desafios");

  const [form, setForm] = useState({ nome: "", descricao: "", solucao: "", desafioId: "", tecnologias: "", links: "", arquivos: "" });
  const [resultado, setResultado] = useState<{ ok?: string; erro?: unknown } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const projeto = projetoReq.data?.projeto ?? null;
  const equipe = equipeReq.data?.equipe ?? null;
  const h = hackathon.data?.hackathon ?? null;

  useEffect(() => {
    if (!projeto) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preenche o formulário com o projeto salvo
    setForm({
      nome: projeto.nome,
      descricao: projeto.descricao,
      solucao: projeto.solucao ?? "",
      desafioId: projeto.desafioId ?? "",
      tecnologias: projeto.tecnologias.join(", "),
      links: paraLinhas(projeto.links, "tipo"),
      arquivos: paraLinhas(projeto.arquivos, "nome"),
    });
  }, [projeto]);

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function salvar(enviar: boolean) {
    setEnviando(true);
    setResultado(null);
    try {
      const body = {
        nome: form.nome,
        descricao: form.descricao,
        solucao: form.solucao || null,
        desafioId: form.desafioId || null,
        tecnologias: form.tecnologias.split(",").map((t) => t.trim()).filter(Boolean),
        links: deLinhas(form.links, "tipo"),
        arquivos: deLinhas(form.arquivos, "nome"),
        enviar,
      };
      await api("/api/projeto", { method: projeto ? "PUT" : "POST", body });
      setResultado({ ok: enviar ? "Projeto enviado para avaliação" : "Rascunho salvo" });
      projetoReq.reload();
    } catch (err) {
      setResultado({ erro: err });
    } finally {
      setEnviando(false);
    }
  }

  const carregando = (hackathon.loading && !hackathon.data) || (equipeReq.loading && !equipeReq.data);

  return (
    <>
      <PageHeader
        tag="participante/projeto"
        title="Projeto da equipe"
        description={h ? `${h.nome} · prazo ${formatarData(h.prazoSubmissao ?? h.dataFim)}` : undefined}
        actions={projeto ? (
          <Badge tone={projeto.situacao === "ENVIADO" ? "ok" : projeto.situacao === "DESCLASSIFICADO" ? "erro" : "neutro"}>
            {projeto.situacao}{projeto.enviadoEm ? ` · ${formatarData(projeto.enviadoEm)}` : ""}
          </Badge>
        ) : null}
      />

      {carregando ? <Loading /> : null}
      {hackathon.error ? <Alert title={hackathon.error.message} /> : null}

      {!carregando && h ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <EquipePanel equipe={equipe} hackathon={h} aoMudar={() => { equipeReq.reload(); projetoReq.reload(); }} />

          <Panel title={projeto ? "Editar projeto" : "Novo projeto"}>
            {!equipe ? <Alert title="Entre em uma equipe para cadastrar o projeto" /> : (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); salvar(false); }}>
                {!h.submissaoAberta ? <div className="md:col-span-2"><Alert title="Submissão fechada para esta edição" /></div> : null}
                <Field label="Nome *"><Input required value={form.nome} onChange={set("nome")} /></Field>
                <Field label="Desafio">
                  <Select value={form.desafioId} onChange={set("desafioId")}>
                    <option value="">Sem desafio</option>
                    {desafios.data?.desafios.map((d) => <option key={d.id} value={d.id}>{d.titulo}</option>)}
                  </Select>
                </Field>
                <div className="md:col-span-2"><Field label="Descrição *"><Textarea required value={form.descricao} onChange={set("descricao")} /></Field></div>
                <div className="md:col-span-2"><Field label="Solução"><Textarea value={form.solucao} onChange={set("solucao")} /></Field></div>
                <div className="md:col-span-2">
                  <Field label="Tecnologias" hint="Separadas por vírgula"><Input value={form.tecnologias} onChange={set("tecnologias")} placeholder="Next.js, Prisma, Figma" /></Field>
                </div>
                <Field label="Links" hint="Um por linha: tipo | url">
                  <Textarea value={form.links} onChange={set("links")} placeholder={"repositorio | https://github.com/...\nvideo | https://youtu.be/..."} />
                </Field>
                <Field label="Arquivos" hint="Um por linha: nome | url">
                  <Textarea value={form.arquivos} onChange={set("arquivos")} placeholder="pitch.pdf | https://drive..." />
                </Field>

                {resultado?.ok ? <div className="md:col-span-2"><Alert tone="ok" title={resultado.ok} /></div> : null}
                {resultado?.erro ? (
                  <div className="md:col-span-2"><Alert title={(resultado.erro as Error).message} lines={detalhesDoErro(resultado.erro)} /></div>
                ) : null}

                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <Button type="submit" variant="ghost" disabled={enviando || !h.submissaoAberta}>Salvar rascunho</Button>
                  <Button type="button" disabled={enviando || !h.submissaoAberta} onClick={() => salvar(true)}>
                    {projeto?.situacao === "ENVIADO" ? "Salvar e manter enviado" : "Enviar para avaliação"}
                  </Button>
                </div>
              </form>
            )}
          </Panel>
        </div>
      ) : null}
    </>
  );
}
