import type { ReactNode } from "react";
import { AlertTriangle, Brain, Check, CircleDot, Clock, Info, ListChecks, Sparkles, Target, X } from "lucide-react";
import { PriorityBadge } from "./badges";
import { STATUSES, WORKFLOW_STEPS, priorityInfo, statusInfo, type IncidentStatus } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";

/** Horizontal progress tracker of the response workflow. */
export function ProgressTracker({ status }: { status: string }) {
  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100">
        <X className="h-5 w-5" />
        <div>
          <p className="font-semibold">Report closed – Rejected</p>
          <p className="text-red-700/90">{STATUSES.REJECTED.description}</p>
        </div>
      </div>
    );
  }
  const current = WORKFLOW_STEPS.indexOf(status as IncidentStatus);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Response progress">
      {WORKFLOW_STEPS.map((s, i) => {
        const done = i < current || status === "RESOLVED";
        const active = i === current && status !== "RESOLVED";
        return (
          <li key={s} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : i <= current ? "bg-royal" : "bg-slate-200")} />
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white",
                  done && "bg-royal text-white",
                  active && "bg-white text-royal ring-2 ring-royal",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === WORKFLOW_STEPS.length - 1 ? "bg-transparent" : i < current ? "bg-royal" : "bg-slate-200",
                )}
              />
            </div>
            <p className={cn("mt-2 text-[11px] font-medium leading-tight sm:text-xs", done || active ? "text-navy" : "text-slate-400")}>
              {STATUSES[s].short}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Vertical timeline of status history. */
export function StatusTimeline({
  history,
}: {
  history: {
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: Date | string;
    changedBy: { name: string; role: string } | null;
  }[];
}) {
  if (!history.length) return <p className="text-sm text-slate-500">No history yet.</p>;
  return (
    <ol className="relative space-y-5 border-l border-slate-200 pl-6">
      {[...history].reverse().map((h) => {
        const changed = h.fromStatus !== h.toStatus;
        const s = statusInfo(h.toStatus);
        return (
          <li key={h.id} className="relative">
            <span className={cn("absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white", changed || !h.fromStatus ? s.dot : "bg-slate-300")}>
              <CircleDot className="h-2.5 w-2.5 text-white" />
            </span>
            <p className="text-sm font-semibold text-navy">
              {!h.fromStatus ? `Created – ${s.label}` : changed ? `${statusInfo(h.fromStatus).short} → ${s.label}` : "Update"}
            </p>
            {h.note && <p className="mt-0.5 text-sm text-slate-600">{h.note}</p>}
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3 w-3" /> {formatDateTime(h.createdAt)}
              {h.changedBy && (
                <>
                  {" · "}
                  {h.changedBy.role === "ADMIN" ? `Security: ${h.changedBy.name}` : "Student"}
                </>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Shows assigned priority, reasons and recommended action from the engine. */
export function ClassificationPanel({
  priority,
  aiPriority,
  score,
  reasons,
  recommendedAction,
  responseCategory,
  escalationLevel,
  responseTeam,
  steps,
  aiNote,
  overridden,
  overrideReason,
  audience = "student",
}: {
  priority: string;
  aiPriority?: string;
  score: number;
  reasons: string[];
  recommendedAction: string;
  responseCategory: string;
  escalationLevel: string;
  responseTeam?: string;
  steps?: string[];
  aiNote?: string | null;
  overridden?: boolean;
  overrideReason?: string | null;
  audience?: "student" | "admin";
}) {
  const p = priorityInfo(priority);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <PriorityBadge priority={priority} className="px-3 py-1 text-sm" />
        <span className="text-sm text-slate-500">
          Risk score <strong className="text-navy">{score}</strong>/100
        </span>
        <span className="text-sm text-slate-500">· {p.target}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: p.color }} />
      </div>

      {overridden && aiPriority && (
        <div className="flex gap-2 rounded-lg bg-violet-50 p-3 text-sm text-violet-900 ring-1 ring-violet-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Priority overridden by security from <strong>{priorityInfo(aiPriority).label}</strong> (auto) to{" "}
            <strong>{p.label}</strong>.{overrideReason ? ` Reason: ${overrideReason}` : ""}
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Response category</p>
          <p className="mt-1 text-sm font-semibold text-navy">{responseCategory}</p>
          {responseTeam && <p className="text-xs text-slate-500">{responseTeam}</p>}
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Escalation level</p>
          <p className="mt-1 text-sm font-semibold text-navy">{escalationLevel}</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Target className="h-4 w-4 text-royal" /> Recommended response action
        </p>
        <p className="mt-1.5 text-sm text-slate-700">{recommendedAction}</p>
      </div>

      {audience === "admin" && steps && steps.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy">
            <ListChecks className="h-4 w-4 text-royal" /> Escalation workflow
          </p>
          <ol className="space-y-1.5">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {aiNote && (
        <div className="flex gap-2 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 ring-1 ring-indigo-100">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>AI advisory note:</strong> {aiNote}
          </p>
        </div>
      )}

      <details className="group rounded-xl border border-slate-200 p-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-navy">
          <Brain className="h-4 w-4 text-royal" /> Why this priority? ({reasons.length} factors)
        </summary>
        <ul className="mt-3 space-y-1.5">
          {reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              {r}
            </li>
          ))}
        </ul>
      </details>

      <p className="flex items-start gap-1.5 text-xs text-slate-500">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Prototype rule-based classification. It is not a validated real-world emergency assessment
        {audience === "admin" ? " – security staff should always apply their own judgement." : "."}
      </p>
    </div>
  );
}

export function DetailItem({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-navy">{children}</dd>
    </div>
  );
}
