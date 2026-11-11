"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Send } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/form";
import { Alert, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { LocationPicker, type SharedLocation } from "@/components/map/location-picker";
import { PriorityBadge, StatusBadge } from "@/components/incidents/badges";
import { apiRequest } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { LOCATION_SOURCE_LABEL, type LocationSource } from "@/lib/constants";

export interface OpenIncident {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  location: { latitude: number; longitude: number; label: string | null; source: string; sharedAt: string } | null;
}

export function LocationShare({ incidents, defaultIncidentId }: { incidents: OpenIncident[]; defaultIncidentId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [incidentId, setIncidentId] = React.useState(defaultIncidentId ?? incidents[0]?.id ?? "");
  const selected = incidents.find((i) => i.id === incidentId);
  const [location, setLocation] = React.useState<SharedLocation | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loc = selected?.location;
    setLocation(
      loc
        ? { latitude: loc.latitude, longitude: loc.longitude, label: loc.label, source: loc.source as LocationSource, accuracy: null }
        : null,
    );
  }, [incidentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function share() {
    if (!selected || !location) return;
    setSaving(true);
    setError(null);
    const res = await apiRequest(`/api/incidents/${selected.id}/location`, "PUT", location);
    setSaving(false);
    if (!res.ok) return setError(res.data.error ?? "Could not share location.");
    toast({ title: "Location shared", description: `Coordinates attached to ${selected.code}. Only campus security can see them.` });
    router.refresh();
  }

  if (!incidents.length) {
    return (
      <Card>
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title="No open incidents"
          description="Location can be shared with campus security for an active incident. Raise an SOS or report an incident first."
          action={
            <div className="flex gap-2">
              <Link href="/student/sos" className={buttonClasses("danger")}>Emergency SOS</Link>
              <Link href="/student/report" className={buttonClasses("secondary")}>Report incident</Link>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="self-start">
        <CardHeader title="Select incident" description="Choose which open incident to share coordinates with." />
        <CardBody className="space-y-4">
          <Field label="Open incident" htmlFor="loc-incident">
            <Select id="loc-incident" value={incidentId} onChange={(e) => setIncidentId(e.target.value)}>
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} – {i.title}
                </option>
              ))}
            </Select>
          </Field>
          {selected && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selected.status} short />
                <PriorityBadge priority={selected.priority} />
              </div>
              {selected.location ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Currently shared</p>
                  <p className="mt-1 font-semibold text-navy">
                    {selected.location.latitude.toFixed(5)}, {selected.location.longitude.toFixed(5)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {LOCATION_SOURCE_LABEL[selected.location.source as LocationSource] ?? selected.location.source} ·{" "}
                    {formatDateTime(selected.location.sharedAt)}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500">No coordinates shared yet for this incident.</p>
              )}
              <Link href={`/student/reports/${selected.id}`} className="text-xs font-semibold text-royal hover:underline">
                View incident details →
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Choose location" description="Share device GPS (after consent), choose a mock demo location, or click the map." icon={<MapPin className="h-5 w-5" />} />
        <CardBody className="space-y-4">
          {error && <Alert tone="danger" title={error} />}
          <LocationPicker value={location} onChange={setLocation} height={380} />
          <div className="flex justify-end">
            <Button onClick={share} loading={saving} disabled={!location}>
              {!saving && <Send className="h-4 w-4" />} Share with campus security
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
