"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { PRIORITIES, PRIORITY_VALUES, STATUS_VALUES, STATUSES, statusInfo } from "@/lib/constants";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/** Full status update form (incident details page). */
export function StatusUpdateForm({ incidentId, currentStatus }: { incidentId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = React.useState(currentStatus);
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setStatus(currentStatus), [currentStatus]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) {
      setError("Choose a different status to update.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await apiRequest(`/api/incidents/${incidentId}/status`, "PATCH", { status, note });
    setLoading(false);
    if (!res.ok) {
      setError(res.data.error ?? "Could not update status.");
      return;
    }
    setNote("");
    toast({ title: "Status updated", description: `Incident is now "${statusInfo(status).label}". The student can see this update.` });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {STATUS_VALUES.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-xs font-semibold transition",
              status === s ? "border-royal bg-royal-50 text-royal ring-2 ring-royal/20" : "border-slate-200 text-slate-600 hover:border-slate-300",
              s === currentStatus && "opacity-70",
            )}
          >
            <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", STATUSES[s].dot)} />
            {STATUSES[s].short}
            {s === currentStatus && <span className="ml-1 font-normal text-slate-400">(current)</span>}
          </button>
        ))}
      </div>
      <Field label="Note for the record / student" htmlFor="status-note" hint="Optional – visible in the student's timeline.">
        <Textarea id="status-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. Patrol team B dispatched to the location." />
      </Field>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Button type="submit" className="w-full" loading={loading} disabled={status === currentStatus}>
        {!loading && <RefreshCw className="h-4 w-4" />} Update status
      </Button>
    </form>
  );
}

/** Admin override of the automatically assigned priority. */
export function PriorityOverrideForm({ incidentId, currentPriority }: { incidentId: string; currentPriority: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [priority, setPriority] = React.useState(currentPriority);
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (priority === currentPriority) return setError("Select a different priority.");
    if (reason.trim().length < 5) return setError("Give a short reason (min 5 characters).");
    setError(null);
    setLoading(true);
    const res = await apiRequest(`/api/incidents/${incidentId}/priority`, "PATCH", { priority, reason });
    setLoading(false);
    if (!res.ok) return setError(res.data.fields?.reason ?? res.data.error ?? "Could not change priority.");
    setReason("");
    toast({ title: "Priority updated", description: `Priority set to ${PRIORITIES[priority as keyof typeof PRIORITIES].label}.` });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="New priority" htmlFor="override-priority">
        <Select id="override-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITY_VALUES.map((p) => (
            <option key={p} value={p}>
              {PRIORITIES[p].label}
              {p === currentPriority ? " (current)" : ""}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Reason" htmlFor="override-reason" required>
        <Textarea id="override-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="e.g. Officer on scene confirms no injury." />
      </Field>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Button type="submit" variant="navy" className="w-full" loading={loading}>
        {!loading && <ShieldAlert className="h-4 w-4" />} Override priority
      </Button>
    </form>
  );
}

/** Compact inline status select (incident management board). */
export function QuickStatusSelect({ incidentId, status }: { incidentId: string; status: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = React.useState(status);
  const [loading, setLoading] = React.useState(false);

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setLoading(true);
    const res = await apiRequest(`/api/incidents/${incidentId}/status`, "PATCH", { status: next, note: "Updated from incident management board" });
    setLoading(false);
    if (!res.ok) {
      setValue(prev);
      toast({ title: "Update failed", description: res.data.error, variant: "error" });
      return;
    }
    toast({ title: "Status updated", description: statusInfo(next).label });
    router.refresh();
  }

  return (
    <Select
      aria-label="Change status"
      value={value}
      disabled={loading}
      onChange={(e) => change(e.target.value)}
      className="h-8 text-xs"
    >
      {STATUS_VALUES.map((s) => (
        <option key={s} value={s}>
          {STATUSES[s].short}
        </option>
      ))}
    </Select>
  );
}

/** One-click escalation actions (escalation center). */
export function EscalationActions({
  incidentId,
  status,
  responseCategory,
}: {
  incidentId: string;
  status: string;
  responseCategory: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function apply(next: string, note: string) {
    setLoading(next);
    const res = await apiRequest(`/api/incidents/${incidentId}/status`, "PATCH", { status: next, note });
    setLoading(null);
    if (!res.ok) return toast({ title: "Action failed", description: res.data.error, variant: "error" });
    toast({ title: "Escalation applied", description: statusInfo(next).label });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "SUBMITTED" && (
        <Button size="sm" variant="secondary" loading={loading === "UNDER_REVIEW"} onClick={() => apply("UNDER_REVIEW", "Acknowledged in Escalation Center")}>
          Acknowledge
        </Button>
      )}
      {(status === "SUBMITTED" || status === "UNDER_REVIEW") && (
        <Button size="sm" variant="danger" loading={loading === "DISPATCHED"} onClick={() => apply("DISPATCHED", `Escalation applied: ${responseCategory} dispatched (simulated)`)}>
          {loading !== "DISPATCHED" && <Zap className="h-3.5 w-3.5" />} Apply recommendation & dispatch
        </Button>
      )}
      {status === "DISPATCHED" && (
        <Button size="sm" variant="primary" loading={loading === "IN_PROGRESS"} onClick={() => apply("IN_PROGRESS", "Responders on scene (simulated)")}>
          Mark in progress
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button size="sm" variant="success" loading={loading === "RESOLVED"} onClick={() => apply("RESOLVED", "Resolved from Escalation Center")}>
          Mark resolved
        </Button>
      )}
    </div>
  );
}

export function StudentStatusToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  async function toggle() {
    setLoading(true);
    const res = await apiRequest(`/api/admin/students/${id}`, "PATCH", { isActive: !isActive });
    setLoading(false);
    if (!res.ok) return toast({ title: "Update failed", description: res.data.error, variant: "error" });
    toast({ title: isActive ? "Account deactivated" : "Account activated" });
    router.refresh();
  }
  return (
    <Button size="sm" variant={isActive ? "secondary" : "success"} loading={loading} onClick={toggle}>
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
