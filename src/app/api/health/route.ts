import { prisma } from "@/src/lib/db";

/** Healthcheck da Railway: responde 200 só se o banco estiver acessível. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
