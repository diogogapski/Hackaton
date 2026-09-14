import { route } from "@/src/lib/http";
import { destroySession } from "@/src/lib/auth/session";

export const POST = route(async () => {
  await destroySession();
  return Response.json({ ok: true });
});
