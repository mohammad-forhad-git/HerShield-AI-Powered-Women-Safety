import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { EmergencyNumbers, SafetySections } from "@/components/student/safety-content";

export const metadata: Metadata = { title: "Safety Tips" };

export default function TipsPage() {
  return (
    <>
      <PageHeader eyebrow="Be prepared" title="Safety tips" description="Practical guidance for staying safe on and around campus." />
      <div className="space-y-6">
        <EmergencyNumbers />
        <SafetySections />
      </div>
    </>
  );
}
