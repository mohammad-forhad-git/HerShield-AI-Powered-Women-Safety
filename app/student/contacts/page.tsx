import type { Metadata } from "next";
import { Info, PartyPopper } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Alert, PageHeader } from "@/components/ui/misc";
import { ContactsManager } from "@/components/contacts/contacts-manager";

export const metadata: Metadata = { title: "Trusted Contacts" };

export default async function ContactsPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const user = await requireRole("STUDENT");
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, phone: true, relationship: true, email: true, isPrimary: true },
  });
  return (
    <>
      <PageHeader
        eyebrow="Safety network"
        title="Trusted emergency contacts"
        description="People who should know when you need help. They receive a simulated alert whenever you submit an emergency report."
      />
      <div className="space-y-6">
        {searchParams.welcome === "1" && (
          <Alert tone="success" icon={<PartyPopper className="h-5 w-5" />} title="Welcome to HerShield!">
            Your account is ready. Start by adding at least one trusted contact.
          </Alert>
        )}
        <ContactsManager initial={contacts} />
        <Alert tone="info" icon={<Info className="h-5 w-5" />} title="How contact alerts work">
          When you trigger SOS or submit a report, HerShield generates a notification for each contact (e.g.
          “Emergency Alert: A student has submitted a Medical Emergency report. Incident ID: HS-1001.”). In this
          prototype the delivery is simulated – no SMS, email, WhatsApp message or call is ever sent.
        </Alert>
      </div>
    </>
  );
}
