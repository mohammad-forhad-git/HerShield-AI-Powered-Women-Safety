import { Calendar, FileText, MapPin, MessageSquare, User } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, SimulationBadge } from "@/components/ui/misc";
import { MapView } from "@/components/map/map-view";
import { DeliveryBadge } from "@/components/notifications/notification-list";
import { CategoryIcon, PriorityBadge, SosTag, StatusBadge } from "./badges";
import { DetailItem, ProgressTracker } from "./incident-parts";
import {
  INJURY_LEVELS,
  LOCATION_SOURCE_LABEL,
  THREAT_LEVELS,
  priorityInfo,
  type LocationSource,
} from "@/lib/constants";
import { formatDateTime, maskPhone } from "@/lib/utils";
import type { IncidentDetail } from "@/lib/incidents";

export function IncidentHeader({ incident }: { incident: IncidentDetail }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <CategoryIcon slug={incident.category.slug} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-royal">{incident.code}</span>
            {incident.isSos && <SosTag />}
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-navy">{incident.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {incident.category.name} · Submitted {formatDateTime(incident.createdAt)} · Last updated{" "}
            {formatDateTime(incident.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function IncidentProgressCard({ incident }: { incident: IncidentDetail }) {
  return (
    <Card>
      <CardBody>
        <ProgressTracker status={incident.status} />
      </CardBody>
    </Card>
  );
}

export function IncidentInfoCard({ incident, showStudent = false }: { incident: IncidentDetail; showStudent?: boolean }) {
  const threat = THREAT_LEVELS.find((t) => t.value === incident.threatLevel)?.label ?? incident.threatLevel;
  const injury = INJURY_LEVELS.find((t) => t.value === incident.injuryLevel)?.label ?? incident.injuryLevel;
  return (
    <Card>
      <CardHeader title="Incident details" icon={<FileText className="h-5 w-5" />} />
      <CardBody className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{incident.description}</p>
        </div>
        {incident.additionalNotes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Additional notes</p>
            <p className="mt-1.5 whitespace-pre-line text-sm text-slate-700">{incident.additionalNotes}</p>
          </div>
        )}
        <dl className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <DetailItem label="Incident ID"><span className="font-mono font-semibold">{incident.code}</span></DetailItem>
          <DetailItem label="Category">{incident.category.name}</DetailItem>
          <DetailItem label="Submitted at">{formatDateTime(incident.createdAt)}</DetailItem>
          <DetailItem label="Occurred at">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDateTime(incident.occurredAt)}</span>
          </DetailItem>
          <DetailItem label="Location">{incident.locationText}</DetailItem>
          <DetailItem label="Reported via">{incident.isSos ? "SOS button" : "Incident report form"}</DetailItem>
          <DetailItem label="Threat level">{threat}</DetailItem>
          <DetailItem label="Injury">{injury}</DetailItem>
          <DetailItem label="Immediate danger">{incident.immediateDanger ? "Yes" : "No"}</DetailItem>
          <DetailItem label="Student's priority">
            {incident.reportedPriority ? priorityInfo(incident.reportedPriority).label : "Not specified"}
          </DetailItem>
          <DetailItem label="Resolved at">{incident.resolvedAt ? formatDateTime(incident.resolvedAt) : "—"}</DetailItem>
        </dl>
        {showStudent && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
              <User className="h-4 w-4 text-royal" /> Reporting student
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              <DetailItem label="Name">{incident.reporter.name}</DetailItem>
              <DetailItem label="Student ID">{incident.reporter.studentProfile?.studentId ?? "—"}</DetailItem>
              <DetailItem label="Department">{incident.reporter.studentProfile?.department ?? "—"}</DetailItem>
              <DetailItem label="Email">{incident.reporter.email}</DetailItem>
              <DetailItem label="Phone">{incident.reporter.phone ?? "—"}</DetailItem>
            </dl>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function IncidentLocationCard({ incident }: { incident: IncidentDetail }) {
  const loc = incident.location;
  return (
    <Card>
      <CardHeader
        title="Shared location"
        description="Visible only to the reporting student and campus security."
        icon={<MapPin className="h-5 w-5" />}
      />
      <CardBody>
        {loc ? (
          <div className="space-y-3">
            <MapView
              height={300}
              center={[loc.latitude, loc.longitude]}
              zoom={16}
              markers={[
                {
                  id: incident.id,
                  lat: loc.latitude,
                  lng: loc.longitude,
                  color: priorityInfo(incident.priority).color,
                  title: incident.code,
                  subtitle: loc.label ?? incident.locationText,
                },
              ]}
            />
            <dl className="grid gap-3 sm:grid-cols-4">
              <DetailItem label="Latitude"><span className="font-mono">{loc.latitude.toFixed(6)}</span></DetailItem>
              <DetailItem label="Longitude"><span className="font-mono">{loc.longitude.toFixed(6)}</span></DetailItem>
              <DetailItem label="Source">{LOCATION_SOURCE_LABEL[loc.source as LocationSource] ?? loc.source}</DetailItem>
              <DetailItem label="Shared at">{formatDateTime(loc.sharedAt)}</DetailItem>
            </dl>
          </div>
        ) : (
          <EmptyState icon={<MapPin className="h-5 w-5" />} title="No coordinates shared" description={`Text location: ${incident.locationText}`} className="py-8" />
        )}
      </CardBody>
    </Card>
  );
}

export function IncidentNotificationsCard({ incident }: { incident: IncidentDetail }) {
  const alerts = incident.notifications.filter((n) => n.type === "CONTACT_ALERT");
  return (
    <Card>
      <CardHeader
        title="Trusted contact alerts"
        description="Simulated notifications generated for this incident"
        icon={<MessageSquare className="h-5 w-5" />}
        action={<SimulationBadge />}
      />
      <CardBody>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No trusted contacts were saved when this incident was reported.</p>
        ) : (
          <ul className="space-y-2.5">
            {alerts.map((n) => (
              <li key={n.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">
                    {n.recipientName} <span className="font-normal text-slate-500">· {maskPhone(n.recipientPhone)}</span>
                  </p>
                  <DeliveryBadge status={n.status} />
                </div>
                <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Sent {formatDateTime(n.createdAt)}
                  {n.deliveredAt ? ` · Delivered ${formatDateTime(n.deliveredAt)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
