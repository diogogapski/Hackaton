/**
 * Cria (ou promove) o administrador inicial. Pensado para produção, onde o seed não roda.
 *
 *   ADMIN_EMAIL=... ADMIN_SENHA=... ADMIN_NOME="..." npm run admin:create
 *
 * Se o e-mail já existir, apenas promove a ADMIN (a senha não é alterada).
 *
 * Com `--se-configurado` (usado no pre-deploy da Railway), não faz nada quando as variáveis não existem.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  const nome = process.env.ADMIN_NOME?.trim() || "Administrador";

  if ((!email || !senha) && process.argv.includes("--se-configurado")) {
    console.log("ADMIN_EMAIL/ADMIN_SENHA não definidos: administrador inicial não foi criado");
    return;
  }
  if (!email || !senha) throw new Error("Defina ADMIN_EMAIL e ADMIN_SENHA");
  if (senha.length < 8) throw new Error("ADMIN_SENHA precisa de pelo menos 8 caracteres");

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    await prisma.user.update({ where: { email }, data: { papel: "ADMIN", situacao: "ATIVO", emailVerificadoEm: new Date() } });
    console.log(`Usuário ${email} promovido a ADMIN`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      nome,
      vinculo: "SERVIDOR",
      papel: "ADMIN",
      emailVerificadoEm: new Date(),
      senhaHash: await bcrypt.hash(senha, 10),
      termosAceitosEm: new Date(),
    },
  });
  console.log(`Administrador ${email} criado`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e instanceof Error ? e.message : e);
    await prisma.$disconnect();
    process.exit(1);
  });
