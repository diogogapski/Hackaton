import { route } from "@/src/lib/http";
import { getCurrentUser } from "@/src/lib/auth";

/** Usuário logado ou `null` — útil para o front decidir o que exibir. */
export const GET = route(async () => {
  return Response.json({ user: await getCurrentUser() });
});
