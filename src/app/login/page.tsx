import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { LoginForm } from "@/src/components/auth/LoginForm";

/** Acesso único: participantes, jurados e organização entram pelo mesmo formulário. */
export default function LoginPage() {
  return (
    <AuthLayout
      tag="acesso"
      title="Entrar no"
      highlight="HACKIF"
      description="Participantes, jurados e organização usam o mesmo acesso. Entre com o e-mail ou com a matrícula, o SIAPE ou o CPF do cadastro: o sistema leva cada pessoa para a sua área."
    >
      <LoginForm />
      <AuthLinks links={[
        { href: "/cadastro", label: "Criar conta" },
        { href: "/recuperar-senha", label: "Esqueci a senha" },
        { href: "/hackathon", label: "Ver edição" },
      ]} />
    </AuthLayout>
  );
}
