import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { ReportForm } from "@/components/incidents/report-form";
import { CATEGORY_SLUGS } from "@/lib/constants";

export const metadata: Metadata = { title: "Report an Incident" };

export default function ReportPage({ searchParams }: { searchParams: { category?: string } }) {
  const initial = CATEGORY_SLUGS.includes(searchParams.category as never) ? searchParams.category! : "";
  return (
    <>
      <PageHeader
        eyebrow="New report"
        title="Report an incident"
        description="Provide full details so campus security can assess and respond. Required fields are marked with *."
      />
      <ReportForm initialCategory={initial} />
    </>
  );
}
