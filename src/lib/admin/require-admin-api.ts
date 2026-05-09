import { getSession } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function requireAdminApi(): Promise<
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
