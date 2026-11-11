import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";

const schema = z.object({ isActive: z.boolean() });

/** Admin: activate / deactivate a student account. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser("ADMIN");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  const student = await prisma.user.findUnique({ where: { id: params.id } });
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }
  const user = await prisma.user.update({ where: { id: params.id }, data: { isActive: parsed.data.isActive } });
  return NextResponse.json({ id: user.id, isActive: user.isActive });
}
