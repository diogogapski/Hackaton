import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

export const hashPassword = (senha: string) => bcrypt.hash(senha, 10);

export const verifyPassword = (senha: string, hash: string) => bcrypt.compare(senha, hash);

/** Token aleatório (enviado ao usuário) e seu hash (salvo no banco). */
export function createToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
