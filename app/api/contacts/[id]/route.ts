import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { contactSchema, fieldErrors } from "@/lib/validation";

type Ctx = { params: { id: string } };

async function ownedContact(id: string, userId: string) {
  const contact = await prisma.emergencyContact.findUnique({ where: { id } });
  return contact && contact.userId === userId ? contact : null;
}

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  if (!(await ownedContact(params.id, auth.user.id))) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  const contact = await prisma.$transaction(async (tx) => {
    if (d.isPrimary) await tx.emergencyContact.updateMany({ where: { userId: auth.user.id }, data: { isPrimary: false } });
    return tx.emergencyContact.update({
      where: { id: params.id },
      data: { name: d.name, phone: d.phone, relationship: d.relationship, email: d.email || null, isPrimary: d.isPrimary },
    });
  });
  return NextResponse.json({ contact });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  const contact = await ownedContact(params.id, auth.user.id);
  if (!contact) return NextResponse.json({ error: "Contact not found." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.emergencyContact.delete({ where: { id: params.id } });
    if (contact.isPrimary) {
      const next = await tx.emergencyContact.findFirst({ where: { userId: auth.user.id }, orderBy: { createdAt: "asc" } });
      if (next) await tx.emergencyContact.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  });
  return NextResponse.json({ ok: true });
}
