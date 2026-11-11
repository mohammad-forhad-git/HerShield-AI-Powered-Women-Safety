import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Brain, CheckCircle2, History, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { incidentDetailInclude } from "@/lib/incidents";
import { parseReasons } from "@/lib/classifier";
import { isOpenStatus } from "@/lib/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { ClassificationPanel, StatusTimeline } from "@/components/incidents/incident-parts";
import {
  IncidentHeader,
  IncidentInfoCard,
  IncidentLocationCard,
  IncidentNotificationsCard,
  IncidentProgressCard,
} from "@/components/incidents/incident-detail";

export default async function StudentIncidentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { submitted?: string };
}) {
  const user = await requireRole("STUDENT");
  const incident = await prisma.incident.findUnique({ where: { id: params.id }, include: incidentDetailInclude });
  // RBAC: students can only view their own incidents.
  if (!incident || incident.reporterId !== user.id) notFound();

  const contactAlerts = incident.notifications.filter((n) => n.type === "CONTACT_ALERT").length;

  return (
    <div className="space-y-6">
      <Link href="/student/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Back to my reports
      </Link>

      {searchParams.submitted === "1" && (
        <Alert tone="success" icon={<CheckCircle2 className="h-5 w-5" />} title={`Incident ${incident.code} submitted successfully`}>
          Campus security can now see your report. {contactAlerts > 0 ? `${contactAlerts} trusted contact(s) received a simulated alert.` : "Add trusted contacts so they can be alerted next time."}
        </Alert>
      )}

      <IncidentHeader incident={incident} />
      <IncidentProgressCard incident={incident} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <IncidentInfoCard incident={incident} />
          <IncidentLocationCard incident={incident} />
          {isOpenStatus(incident.status) && (
            <div className="flex justify-end">
              <Link href={`/student/location?incident=${incident.id}`} className={buttonClasses("secondary")}>
                <MapPin className="h-4 w-4" /> {incident.location ? "Update shared location" : "Share location"}
              </Link>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Priority classification" icon={<Brain className="h-5 w-5" />} />
            <CardBody>
              <ClassificationPanel
                priority={incident.priority}
                aiPriority={incident.aiPriority}
                score={incident.aiScore}
                reasons={parseReasons(incident.aiReasons)}
                recommendedAction={incident.recommendedAction}
                responseCategory={incident.responseCategory}
                responseTeam={incident.category.responseTeam}
                escalationLevel={incident.escalationLevel}
                overridden={incident.priorityOverridden}
                overrideReason={incident.overrideReason}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Status history" description="Every update from campus security" icon={<History className="h-5 w-5" />} />
            <CardBody>
              <StatusTimeline history={incident.statusHistory} />
            </CardBody>
          </Card>
          <IncidentNotificationsCard incident={incident} />
        </div>
      </div>
    </div>
  );
}
