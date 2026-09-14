import { redirect } from "next/navigation";

/** /cadastro sem vínculo abre o cadastro de aluno; as abas levam aos demais. */
export default function CadastroInicioPage() {
  redirect("/cadastro/aluno");
}
