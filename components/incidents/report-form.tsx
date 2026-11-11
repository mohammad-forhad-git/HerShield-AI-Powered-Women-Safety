"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Brain, FileText, MapPin, Send, ShieldAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { CategoryPicker } from "./category-picker";
import { PriorityBadge } from "./badges";
import { LocationPicker, type SharedLocation } from "@/components/map/location-picker";
import { classifyIncident } from "@/lib/classifier";
import { INJURY_LEVELS, PRIORITIES, PRIORITY_VALUES, THREAT_LEVELS, priorityInfo } from "@/lib/constants";
import { incidentSchema, fieldErrors } from "@/lib/validation";
import { apiRequest } from "@/lib/api-client";
import { localDateTimeInputValue } from "@/lib/utils";

export function ReportForm({ initialCategory = "" }: { initialCategory?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [categorySlug, setCategory] = React.useState(initialCategory);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [locationText, setLocationText] = React.useState("");
  const [occurredAt, setOccurredAt] = React.useState("");
  const [additionalNotes, setNotes] = React.useState("");
  const [reportedPriority, setReportedPriority] = React.useState("");
  const [threatLevel, setThreat] = React.useState("NONE");
  const [injuryLevel, setInjury] = React.useState("NONE");
  const [immediateDanger, setDanger] = React.useState(false);
  const [location, setLocation] = React.useState<SharedLocation | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Set the default date/time on the client to avoid hydration mismatches.
  React.useEffect(() => setOccurredAt(localDateTimeInputValue()), []);

  const preview = React.useMemo(
    () =>
      categorySlug
        ? classifyIncident({ categorySlug, title, description, additionalNotes, threatLevel, injuryLevel, immediateDanger })
        : null,
    [categorySlug, title, description, additionalNotes, threatLevel, injuryLevel, immediateDanger],
  );

  function onLocation(v: SharedLocation | null) {
    setLocation(v);
    if (v?.label && !locationText) setLocationText(v.label);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const payload = {
      categorySlug,
      title,
      description,
      locationText,
      occurredAt: occurredAt ? new Date(occurredAt).toISOString() : "",
      additionalNotes,
      reportedPriority: reportedPriority || null,
      threatLevel,
      injuryLevel,
      immediateDanger,
      isSos: false,
      location,
    };
    const parsed = incidentSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError("Please complete the required fields highlighted below.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const res = await apiRequest<{ incident: { id: string; code: string } }>("/api/incidents", "POST", payload);
    setSubmitting(false);
    if (!res.ok) {
      setErrors(res.data.fields ?? {});
      setFormError(res.data.error ?? "Could not submit the report.");
      return;
    }
    toast({ title: `Incident ${res.data.incident.code} submitted`, description: "Campus security has been notified (simulated)." });
    router.push(`/student/reports/${res.data.incident.id}?submitted=1`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {formError && <Alert tone="danger" title={formError} />}

        <Card>
          <CardHeader title="1. Emergency category" description="Choose what best describes the incident." icon={<ShieldAlert className="h-5 w-5" />} />
          <CardBody>
            <CategoryPicker value={categorySlug} onChange={setCategory} error={errors.categorySlug} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="2. Incident details" description="Clear details help security respond faster." icon={<FileText className="h-5 w-5" />} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Incident title" htmlFor="title" required error={errors.title} className="sm:col-span-2">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Being followed near the bus stand" maxLength={120} />
            </Field>
            <Field
              label="Incident description"
              htmlFor="description"
              required
              error={errors.description}
              hint={`${description.length}/2000 – mention injuries, threats or anything happening right now.`}
              className="sm:col-span-2"
            >
              <Textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} maxLength={2000} placeholder="Describe what happened, who was involved and your current situation…" />
            </Field>
            <Field label="Date and time" htmlFor="occurredAt" required error={errors.occurredAt}>
              <Input id="occurredAt" type="datetime-local" value={occurredAt} max={localDateTimeInputValue()} onChange={(e) => setOccurredAt(e.target.value)} error={errors.occurredAt} />
            </Field>
            <Field label="Your priority level" htmlFor="reportedPriority" hint="How urgent does it feel to you? The system also classifies automatically.">
              <Select id="reportedPriority" value={reportedPriority} onChange={(e) => setReportedPriority(e.target.value)}>
                <option value="">Not sure</option>
                {PRIORITY_VALUES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITIES[p].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Threat level" htmlFor="threatLevel">
              <Select id="threatLevel" value={threatLevel} onChange={(e) => setThreat(e.target.value)}>
                {THREAT_LEVELS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} – {t.hint}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Injury" htmlFor="injuryLevel">
              <Select id="injuryLevel" value={injuryLevel} onChange={(e) => setInjury(e.target.value)}>
                {INJURY_LEVELS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Toggle id="immediateDanger" tone="sos" checked={immediateDanger} onChange={setDanger} label="I am in immediate danger" description="Turn on if the threat is happening right now." />
            </div>
            <Field label="Additional notes" htmlFor="notes" hint="Optional – descriptions of people, vehicles, witnesses…" className="sm:col-span-2">
              <Textarea id="notes" rows={3} value={additionalNotes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="3. Location" description="Describe the place and optionally share coordinates." icon={<MapPin className="h-5 w-5" />} />
          <CardBody className="space-y-4">
            <Field label="Incident location" htmlFor="locationText" required error={errors.locationText}>
              <Input id="locationText" value={locationText} onChange={(e) => setLocationText(e.target.value)} error={errors.locationText} placeholder="e.g. Transport Hub, near gate 2" />
            </Field>
            <LocationPicker value={location} onChange={onLocation} />
          </CardBody>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="lg" loading={submitting}>
            {!submitting && <Send className="h-4 w-4" />} Submit incident report
          </Button>
        </div>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader title="Automatic priority preview" description="Updates live as you type." icon={<Brain className="h-5 w-5" />} />
          <CardBody>
            {preview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={preview.priority} className="px-3 py-1 text-sm" />
                  <span className="text-sm text-slate-500">
                    Score <strong className="text-navy">{preview.score}</strong>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${preview.score}%`, backgroundColor: priorityInfo(preview.priority).color }} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recommended action</p>
                  <p className="mt-1 text-sm text-slate-700">{preview.recommendedAction}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Why</p>
                  <ul className="mt-1 space-y-1">
                    {preview.reasons.slice(-4).map((r, i) => (
                      <li key={i} className="text-xs text-slate-600">• {r}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-[11px] text-slate-400">Prototype classification – final priority is confirmed on submission and may be adjusted by security.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a category to see how HerShield will prioritise this report.</p>
            )}
          </CardBody>
        </Card>
      </aside>
    </form>
  );
}
