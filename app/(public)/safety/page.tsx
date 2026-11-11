import type { Metadata } from "next";
import { EmergencyNumbers, SafetySections } from "@/components/student/safety-content";

export const metadata: Metadata = { title: "Safety Guidelines" };

export default function SafetyPage() {
  return (
    <div className="bg-canvas">
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-royal">Safety guidelines</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy">Stay safe on and around campus</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Practical guidance for travelling, late hours, harassment, medical and fire emergencies. If you are in danger,
          use the HerShield SOS button – and in a real emergency in Bangladesh call 999.
        </p>
        <div className="mt-8">
          <EmergencyNumbers />
        </div>
        <div className="mt-8">
          <SafetySections />
        </div>
      </section>
    </div>
  );
}
