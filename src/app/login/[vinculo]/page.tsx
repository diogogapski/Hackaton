import { notFound } from "next/navigation";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { LoginForm, type VinculoLogin } from "@/src/components/auth/LoginForm";

const telas = {
  aluno: {
    vinculo: "ALUNO",
    title: "Acesso de",
    highlight: "aluno",
    description: "Entre com a matrícula ou o e-mail e a senha cadastrada.",
    cadastro: "/cadastro/aluno",
  },
  servidor: {
    vinculo: "SERVIDOR",
    title: "Acesso de",
    highlight: "servidor",
    description: "Servidores e professores entram com o SIAPE ou o e-mail e a senha cadastrada.",
    cadastro: "/cadastro/servidor",
  },
  externo: {
    vinculo: "EXTERNO",
    title: "Acesso",
    highlight: "externo",
    description: "Egressos, jurados externos, parceiros e convidados entram com CPF ou e-mail e senha.",
    cadastro: "/cadastro/externo",
  },
} satisfies Record<string, { vinculo: VinculoLogin; title: string; highlight: string; description: string; cadastro: string }>;

export function generateStaticParams() {
  return Object.keys(telas).map((vinculo) => ({ vinculo }));
}

/** Login por vínculo (planejamento, páginas 7, 8 e 9). */
export default async function LoginVinculoPage({ params }: { params: Promise<{ vinculo: string }> }) {
  const { vinculo } = await params;
  const tela = telas[vinculo as keyof typeof telas];
  if (!tela) notFound();

  return (
    <AuthLayout tag={`acesso/${vinculo}`} title={tela.title} highlight={tela.highlight} description={tela.description}>
      <LoginForm vinculo={tela.vinculo} />
      <AuthLinks links={[
        { href: "/login", label: "← Outro tipo de acesso" },
        { href: tela.cadastro, label: "Criar conta" },
        { href: "/recuperar-senha", label: "Esqueci a senha" },
      ]} />
    </AuthLayout>
  );
}
