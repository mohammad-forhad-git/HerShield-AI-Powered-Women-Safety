import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";

/** Mark the student's in-app notifications as read. */
export async function PATCH() {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  const result = await prisma.notification.updateMany({
    where: { userId: auth.user.id, isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ updated: result.count });
}
