import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { contactSchema, fieldErrors } from "@/lib/validation";

const MAX_CONTACTS = 10;

export async function GET() {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const existing = await prisma.emergencyContact.count({ where: { userId: auth.user.id } });
  if (existing >= MAX_CONTACTS) {
    return NextResponse.json({ error: `You can save up to ${MAX_CONTACTS} trusted contacts.` }, { status: 400 });
  }
  const d = parsed.data;
  const makePrimary = d.isPrimary || existing === 0;
  const contact = await prisma.$transaction(async (tx) => {
    if (makePrimary) await tx.emergencyContact.updateMany({ where: { userId: auth.user.id }, data: { isPrimary: false } });
    return tx.emergencyContact.create({
      data: {
        userId: auth.user.id,
        name: d.name,
        phone: d.phone,
        relationship: d.relationship,
        email: d.email || null,
        isPrimary: makePrimary,
      },
    });
  });
  return NextResponse.json({ contact }, { status: 201 });
}
