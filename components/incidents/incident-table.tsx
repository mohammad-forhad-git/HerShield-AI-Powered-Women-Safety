"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList, MapPin, Search, X } from "lucide-react";
import { CategoryIcon, PriorityBadge, SosTag, StatusBadge } from "./badges";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRIORITIES, PRIORITY_VALUES, STATUS_VALUES, STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { IncidentRow } from "@/lib/incidents";

type Sort = "newest" | "oldest" | "priority";

/** Searchable, filterable incident table used by students and admins. */
export function IncidentTable({
  rows,
  basePath,
  showStudent = false,
  initialStatus = "",
  emptyAction,
  pageSize = 12,
}: {
  rows: IncidentRow[];
  basePath: string;
  showStudent?: boolean;
  initialStatus?: string;
  emptyAction?: React.ReactNode;
  pageSize?: number;
}) {
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [status, setStatus] = React.useState(initialStatus);
  const [sort, setSort] = React.useState<Sort>("newest");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (category && r.categorySlug !== category) return false;
      if (priority && r.priority !== priority) return false;
      if (status && r.status !== status) return false;
      if (!term) return true;
      return [r.code, r.title, r.locationText, r.studentName, r.studentId, r.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    return list.sort((a, b) => {
      if (sort === "priority") {
        const d =
          (PRIORITIES[b.priority as keyof typeof PRIORITIES]?.rank ?? 0) -
          (PRIORITIES[a.priority as keyof typeof PRIORITIES]?.rank ?? 0);
        if (d !== 0) return d;
      }
      const t = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === "oldest" ? -t : t;
    });
  }, [rows, q, category, priority, status, sort]);

  React.useEffect(() => setPage(1), [q, category, priority, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = q || category || priority || status;

  return (
    <div>
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <Input
          aria-label="Search incidents"
          placeholder={showStudent ? "Search by incident ID, title, student…" : "Search by incident ID or title…"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
        <Select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITY_VALUES.map((p) => (
            <option key={p} value={p}>
              {PRIORITIES[p].label}
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {STATUSES[s].short}
            </option>
          ))}
        </Select>
        <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Highest priority</option>
        </Select>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-500">
        <span>
          Showing <strong className="text-navy">{filtered.length}</strong> of {rows.length} incident{rows.length === 1 ? "" : "s"}
        </span>
        {hasFilters && (
          <button
            onClick={() => {
              setQ("");
              setCategory("");
              setPriority("");
              setStatus("");
            }}
            className="inline-flex items-center gap-1 font-medium text-royal hover:underline"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title={rows.length === 0 ? "No incidents yet" : "No incidents match your filters"}
          description={rows.length === 0 ? "Reported incidents will appear here." : "Try adjusting the search or filters."}
          action={rows.length === 0 ? emptyAction : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Category</th>
                {showStudent && <th className="px-4 py-3">Student</th>}
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3" aria-label="Open" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((r) => (
                <tr key={r.id} className="group transition-colors hover:bg-slate-50/70">
                  <td className="max-w-[280px] px-4 py-3">
                    <Link href={`${basePath}/${r.id}`} className="block">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-royal">{r.code}</span>
                        {r.isSos && <SosTag />}
                        {r.hasLocation && <MapPin className="h-3.5 w-3.5 text-slate-400" aria-label="Location shared" />}
                      </span>
                      <span className="mt-0.5 block truncate font-medium text-navy">{r.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <CategoryIcon slug={r.categorySlug} size="sm" />
                      <span className="text-slate-700">{r.categoryName}</span>
                    </span>
                  </td>
                  {showStudent && (
                    <td className="px-4 py-3">
                      <span className="block font-medium text-navy">{r.studentName}</span>
                      <span className="block text-xs text-slate-500">{r.studentId}</span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} short />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`${basePath}/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-royal opacity-80 group-hover:opacity-100"
                    >
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
