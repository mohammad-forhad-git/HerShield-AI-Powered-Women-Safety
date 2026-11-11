"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { StudentStatusToggle } from "./incident-actions";
import { formatDate, initials } from "@/lib/utils";

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  studentId: string;
  department: string | null;
  isActive: boolean;
  contacts: number;
  incidents: number;
  openIncidents: number;
  lastIncidentId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const [q, setQ] = React.useState("");
  const [state, setState] = React.useState("");
  const filtered = rows.filter((r) => {
    if (state === "active" && !r.isActive) return false;
    if (state === "inactive" && r.isActive) return false;
    if (state === "open" && r.openIncidents === 0) return false;
    const t = q.trim().toLowerCase();
    return !t || [r.name, r.email, r.studentId, r.department].join(" ").toLowerCase().includes(t);
  });

  return (
    <div>
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_auto]">
        <Input aria-label="Search students" placeholder="Search by name, student ID, email…" value={q} onChange={(e) => setQ(e.target.value)} icon={<Search className="h-4 w-4" />} />
        <Select aria-label="Filter students" value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">All students</option>
          <option value="open">With open incidents</option>
          <option value="active">Active accounts</option>
          <option value="inactive">Deactivated accounts</option>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<GraduationCap className="h-5 w-5" />} title="No students found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Trusted contacts</th>
                <th className="px-4 py-3">Incidents</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className={r.isActive ? "" : "bg-slate-50/70 text-slate-400"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal-50 text-xs font-bold text-royal">{initials(r.name)}</div>
                      <div>
                        <p className="font-semibold text-navy">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.department ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.studentId}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{r.email}</p>
                    <p className="text-xs text-slate-500">{r.phone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.contacts}</td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums font-semibold text-navy">{r.incidents}</span>
                    {r.openIncidents > 0 && (
                      <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-sos ring-1 ring-red-100">{r.openIncidents} open</span>
                    )}
                    {r.lastIncidentId && (
                      <Link href={`/admin/incidents/${r.lastIncidentId}`} className="ml-2 text-xs font-semibold text-royal hover:underline">latest</Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${r.isActive ? "bg-success" : "bg-slate-400"}`} />
                      <StudentStatusToggle id={r.id} isActive={r.isActive} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
