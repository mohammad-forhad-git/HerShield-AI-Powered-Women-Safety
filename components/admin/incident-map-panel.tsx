"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { CategoryIcon, PriorityBadge, SosTag, StatusBadge } from "@/components/incidents/badges";
import { PRIORITIES, PRIORITY_VALUES, isOpenStatus, priorityInfo } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";

export interface MapIncident {
  id: string;
  code: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  priority: string;
  status: string;
  isSos: boolean;
  lat: number;
  lng: number;
  label: string | null;
  source: string;
  locationText: string;
  studentName: string;
  createdAt: string;
  recommendedAction: string;
}

export function IncidentMapPanel({ incidents, height = 560 }: { incidents: MapIncident[]; height?: number }) {
  const [scope, setScope] = React.useState<"open" | "all">("open");
  const [priority, setPriority] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const visible = incidents.filter(
    (i) => (scope === "all" || isOpenStatus(i.status)) && (!priority || i.priority === priority),
  );
  const selected = visible.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(["open", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn("rounded-md px-3 py-1 text-xs font-semibold", scope === s ? "bg-white text-navy shadow-sm" : "text-slate-600")}
              >
                {s === "open" ? "Open incidents" : "All incidents"}
              </button>
            ))}
          </div>
          <Select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="h-8 w-40 text-xs">
            <option value="">All priorities</option>
            {PRIORITY_VALUES.map((p) => (
              <option key={p} value={p}>{PRIORITIES[p].label}</option>
            ))}
          </Select>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {PRIORITY_VALUES.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full ring-2 ring-white" style={{ backgroundColor: PRIORITIES[p].color }} />
                {PRIORITIES[p].label}
              </span>
            ))}
          </div>
        </div>
        <MapView
          height={height}
          fitToMarkers
          selectedId={selectedId}
          onMarkerClick={setSelectedId}
          markers={visible.map((i) => ({
            id: i.id,
            lat: i.lat,
            lng: i.lng,
            color: priorityInfo(i.priority).color,
            title: `${i.code} · ${i.categoryName}`,
            subtitle: `${priorityInfo(i.priority).label} priority · ${i.label ?? i.locationText}`,
            href: `/admin/incidents/${i.id}`,
          }))}
        />
        <p className="mt-2 px-1 text-xs text-slate-500">
          Simulated monitoring view · {visible.length} incident{visible.length === 1 ? "" : "s"} with shared coordinates. Click a marker for details.
        </p>
      </Card>

      <div className="space-y-4">
        {selected ? (
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <CategoryIcon slug={selected.categorySlug} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-royal">{selected.code}</span>
                  {selected.isSos && <SosTag />}
                </div>
                <p className="mt-0.5 font-semibold text-navy">{selected.title}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <PriorityBadge priority={selected.priority} />
              <StatusBadge status={selected.status} short />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Student</dt><dd className="font-medium text-navy">{selected.studentName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Reported</dt><dd className="text-navy">{formatDateTime(selected.createdAt)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Place</dt><dd className="text-right text-navy">{selected.label ?? selected.locationText}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Coordinates</dt><dd className="font-mono text-xs text-navy">{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</dd></div>
            </dl>
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-slate-700">
              <p className="font-semibold text-navy">Recommended action</p>
              {selected.recommendedAction}
            </div>
            <Link href={`/admin/incidents/${selected.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal">
              Open full incident <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ) : (
          <Card className="p-5 text-sm text-slate-500">
            <MapPin className="mb-2 h-5 w-5 text-royal" />
            Select a marker or an incident below to see its details.
          </Card>
        )}
        <Card className="max-h-[420px] overflow-y-auto">
          <ul className="divide-y divide-slate-100">
            {visible.map((i) => (
              <li key={i.id}>
                <button
                  onClick={() => setSelectedId(i.id)}
                  className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50", selectedId === i.id && "bg-blue-50/60")}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: priorityInfo(i.priority).color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs font-semibold text-royal">{i.code}</span>
                    <span className="block truncate text-sm text-navy">{i.title}</span>
                  </span>
                  <StatusBadge status={i.status} short />
                </button>
              </li>
            ))}
            {visible.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-500">No incidents with coordinates match.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
