import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Brain, History, RefreshCw, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { incidentDetailInclude } from "@/lib/incidents";
import { parseReasons, playbookSteps } from "@/lib/classifier";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ClassificationPanel, StatusTimeline } from "@/components/incidents/incident-parts";
import {
  IncidentHeader,
  IncidentInfoCard,
  IncidentLocationCard,
  IncidentNotificationsCard,
  IncidentProgressCard,
} from "@/components/incidents/incident-detail";
import { PriorityOverrideForm, StatusUpdateForm } from "@/components/admin/incident-actions";

export default async function AdminIncidentPage({ params }: { params: { id: string } }) {
  const incident = await prisma.incident.findUnique({ where: { id: params.id }, include: incidentDetailInclude });
  if (!incident) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/incidents" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> All reports
      </Link>
      <IncidentHeader incident={incident} />
      <IncidentProgressCard incident={incident} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="AI classification & escalation recommendation"
              description="Rule-based engine output – review before acting"
              icon={<Brain className="h-5 w-5" />}
            />
            <CardBody>
              <ClassificationPanel
                audience="admin"
                priority={incident.priority}
                aiPriority={incident.aiPriority}
                score={incident.aiScore}
                reasons={parseReasons(incident.aiReasons)}
                recommendedAction={incident.recommendedAction}
                responseCategory={incident.responseCategory}
                responseTeam={incident.category.responseTeam}
                escalationLevel={incident.escalationLevel}
                steps={playbookSteps(incident.category.slug)}
                aiNote={incident.aiNote}
                overridden={incident.priorityOverridden}
                overrideReason={incident.overrideReason}
              />
            </CardBody>
          </Card>
          <IncidentInfoCard incident={incident} showStudent />
          <IncidentLocationCard incident={incident} />
          <IncidentNotificationsCard incident={incident} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Update status" description="The student sees changes immediately" icon={<RefreshCw className="h-5 w-5" />} />
            <CardBody>
              <StatusUpdateForm incidentId={incident.id} currentStatus={incident.status} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Override priority" description={`Auto-assigned: ${incident.aiPriority}`} icon={<ShieldAlert className="h-5 w-5" />} />
            <CardBody>
              <PriorityOverrideForm incidentId={incident.id} currentPriority={incident.priority} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Status history" icon={<History className="h-5 w-5" />} />
            <CardBody>
              <StatusTimeline history={incident.statusHistory} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
