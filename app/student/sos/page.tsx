import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { SosFlow } from "@/components/incidents/sos";

export const metadata: Metadata = { title: "Emergency SOS" };

export default async function SosPage({ searchParams }: { searchParams: { confirmed?: string } }) {
  const user = await requireRole("STUDENT");
  const contactsCount = await prisma.emergencyContact.count({ where: { userId: user.id } });
  return (
    <>
      <PageHeader
        eyebrow="Emergency"
        title="Emergency SOS"
        description="Raise an emergency in seconds. This is a simulation: campus security sees the alert in the prototype console, but no real services are contacted."
      />
      <SosFlow initialConfirmed={searchParams.confirmed === "1"} contactsCount={contactsCount} />
    </>
  );
}
