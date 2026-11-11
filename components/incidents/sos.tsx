"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ClipboardList, MessageSquare, Send, Siren, Users } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { Alert, SimulationBadge } from "@/components/ui/misc";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CategoryPicker } from "./category-picker";
import { PriorityBadge, StatusBadge } from "./badges";
import { LocationPicker, type SharedLocation } from "@/components/map/location-picker";
import { INJURY_LEVELS, getCategory } from "@/lib/constants";
import { apiRequest } from "@/lib/api-client";
import { cn, formatDateTime, maskPhone } from "@/lib/utils";
import type { Classification } from "@/lib/classifier";

/* ------------------------------ Big SOS button ------------------------------ */

export function SosBigButton({ onClick, size = "lg" }: { onClick: () => void; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-44 w-44 sm:h-52 sm:w-52" : "h-32 w-32";
  return (
    <div className="relative flex items-center justify-center">
      <span className={cn("absolute rounded-full bg-sos/40 animate-sos-pulse", dim)} aria-hidden />
      <span className={cn("absolute rounded-full bg-sos/25 animate-sos-pulse [animation-delay:0.6s]", dim)} aria-hidden />
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-sos-700 text-white shadow-sos focus:outline-none focus-visible:ring-8 focus-visible:ring-sos/30",
          dim,
        )}
        aria-label="Trigger emergency SOS"
      >
        <AlertTriangle className={size === "lg" ? "h-10 w-10" : "h-7 w-7"} />
        <span className={cn("font-black tracking-widest", size === "lg" ? "mt-1 text-4xl" : "text-2xl")}>SOS</span>
        <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-100">Tap for help</span>
      </motion.button>
    </div>
  );
}

function SosConfirmDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      tone="danger"
      icon={<Siren className="h-6 w-6" />}
      title="Trigger an emergency SOS?"
      description={
        <div className="space-y-2">
          <p>
            Campus security will receive your emergency report and your trusted contacts will get an alert.
          </p>
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Academic prototype: alerts are simulated – no real SMS, calls or emergency services are contacted. In a real
            emergency in Bangladesh call 999.
          </p>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            <Siren className="h-4 w-4" /> Yes, I need help
          </Button>
        </>
      }
    />
  );
}

/** Dashboard SOS card: confirm then go to the SOS reporting interface. */
export function SosLauncher() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <SosBigButton size="md" onClick={() => setOpen(true)} />
      <SosConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          router.push("/student/sos?confirmed=1");
        }}
      />
    </>
  );
}

/* ------------------------------ Full SOS flow ------------------------------ */

interface SosResult {
  incident: { id: string; code: string; status: string; priority: string; createdAt: string };
  classification: Classification;
  contactsNotified: { name: string; relationship: string; phone: string }[];
}

export function SosFlow({ initialConfirmed, contactsCount }: { initialConfirmed: boolean; contactsCount: number }) {
  const router = useRouter();
  const [stage, setStage] = React.useState<"idle" | "form" | "done">(initialConfirmed ? "form" : "idle");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [categorySlug, setCategory] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [injuryLevel, setInjury] = React.useState("NONE");
  const [danger, setDanger] = React.useState(true);
  const [locationText, setLocationText] = React.useState("");
  const [location, setLocation] = React.useState<SharedLocation | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<SosResult | null>(null);

  async function submit() {
    if (!categorySlug) {
      setErrors({ categorySlug: "Select the type of emergency" });
      return;
    }
    setErrors({});
    setError(null);
    setSubmitting(true);
    const category = getCategory(categorySlug);
    const text = details.trim();
    const res = await apiRequest<SosResult>("/api/incidents", "POST", {
      categorySlug,
      title: `SOS – ${category.name}`,
      description: text.length >= 10 ? text : `SOS alert triggered via the HerShield emergency button.${text ? ` ${text}` : ""}`,
      locationText: locationText.trim() || location?.label || "Location not specified (SOS)",
      occurredAt: new Date().toISOString(),
      threatLevel: danger ? "MODERATE" : "NONE",
      injuryLevel,
      immediateDanger: danger,
      isSos: true,
      location,
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrors(res.data.fields ?? {});
      setError(res.data.error ?? "Could not send SOS. Please try again.");
      return;
    }
    setResult(res.data);
    setStage("done");
    router.refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (stage === "idle") {
    return (
      <Card className="overflow-hidden">
        <div className="grid items-center gap-8 bg-gradient-to-br from-white via-white to-red-50 p-8 md:grid-cols-2 md:p-12">
          <div>
            <SimulationBadge />
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy">Need help right now?</h2>
            <p className="mt-3 text-slate-600">
              Press the SOS button. After you confirm, choose what&apos;s happening, attach your location and HerShield
              will create an emergency incident, classify its priority and alert your trusted contacts.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Unique incident ID & timestamp</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Automatic priority & escalation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {contactsCount} trusted contact{contactsCount === 1 ? "" : "s"} alerted (simulated)</li>
            </ul>
            {contactsCount === 0 && (
              <Alert tone="warning" className="mt-5" title="No trusted contacts yet">
                <Link href="/student/contacts" className="font-semibold underline">Add trusted contacts</Link> so they can be alerted.
              </Alert>
            )}
          </div>
          <div className="flex justify-center py-6">
            <SosBigButton onClick={() => setConfirmOpen(true)} />
          </div>
        </div>
        <SosConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            setStage("form");
          }}
        />
      </Card>
    );
  }

  if (stage === "form") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-sos p-4 text-white shadow-sos">
          <Siren className="h-6 w-6 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <p className="font-bold">SOS mode active</p>
            <p className="text-sm text-red-100">Pick a category and press “Send SOS”. Everything else is optional.</p>
          </div>
        </div>
        {error && <Alert tone="danger" title={error} />}

        <Card>
          <CardHeader title="What is happening?" description="Required" />
          <CardBody>
            <CategoryPicker compact value={categorySlug} onChange={setCategory} error={errors.categorySlug} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick details" description="Optional, but helps responders." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Short description" htmlFor="sos-details" className="sm:col-span-2" error={errors.description}>
              <Textarea id="sos-details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g. Someone is following me near the bus stand" maxLength={2000} />
            </Field>
            <Field label="Injury" htmlFor="sos-injury">
              <Select id="sos-injury" value={injuryLevel} onChange={(e) => setInjury(e.target.value)}>
                {INJURY_LEVELS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Where are you?" htmlFor="sos-place" error={errors.locationText}>
              <Input id="sos-place" value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="Landmark or building" />
            </Field>
            <div className="sm:col-span-2">
              <Toggle id="sos-danger" tone="sos" checked={danger} onChange={setDanger} label="I am in immediate danger" description="Keep on if the threat is happening right now." />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Share location" description="Uses device location only with your permission, or a mock location for demos." />
          <CardBody>
            <LocationPicker value={location} onChange={(v) => { setLocation(v); if (v?.label && !locationText) setLocationText(v.label); }} height={240} compact />
          </CardBody>
        </Card>

        <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-2 rounded-2xl bg-white/90 p-3 shadow-lift ring-1 ring-slate-200 backdrop-blur sm:flex-row sm:justify-end">
          <Button variant="secondary" size="lg" onClick={() => setStage("idle")} disabled={submitting}>
            Cancel SOS
          </Button>
          <Button variant="danger" size="lg" onClick={submit} loading={submitting} className="sm:min-w-[200px]">
            {!submitting && <Send className="h-4 w-4" />} Send SOS
          </Button>
        </div>
      </div>
    );
  }

  // ---- done ----
  if (!result) return null;
  const c = result.classification;
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-100">Emergency recorded · campus security notified (simulated)</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{result.incident.code}</p>
                <p className="mt-1 text-sm text-green-50">Submitted {formatDateTime(result.incident.createdAt)}</p>
              </div>
            </div>
          </div>
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
              <div className="mt-1.5"><StatusBadge status={result.incident.status} /></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned priority</p>
              <div className="mt-1.5"><PriorityBadge priority={result.incident.priority} /></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Response</p>
              <p className="mt-1.5 text-sm font-semibold text-navy">{c.responseCategory}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 text-sm text-slate-700 sm:col-span-3">
              <p className="font-semibold text-navy">What happens next</p>
              <p className="mt-1">{c.recommendedAction}</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <Card>
        <CardHeader title="Trusted contact alerts" description="Simulated delivery – no real messages were sent." icon={<Users className="h-5 w-5" />} action={<SimulationBadge />} />
        <CardBody>
          {result.contactsNotified.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have no trusted contacts. <Link href="/student/contacts" className="font-semibold text-royal">Add contacts</Link> so they are alerted next time.
            </p>
          ) : (
            <ul className="space-y-2">
              {result.contactsNotified.map((ct, i) => (
                <motion.li
                  key={ct.phone + i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.25 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-royal" />
                    <div>
                      <p className="text-sm font-semibold text-navy">{ct.name} <span className="font-normal text-slate-500">· {ct.relationship}</span></p>
                      <p className="text-xs text-slate-500">SMS (simulated) to {maskPhone(ct.phone)}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                    <CheckCircle2 className="h-3 w-3" /> Delivered
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/student/reports/${result.incident.id}`} className={buttonClasses("primary", "lg")}>
          <ClipboardList className="h-4 w-4" /> Track this incident
        </Link>
        <Link href="/student/location" className={buttonClasses("secondary", "lg")}>
          Update my location
        </Link>
        <Link href="/student" className={buttonClasses("ghost", "lg")}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
