"use client";

import * as React from "react";
import Link from "next/link";
import { BellRing, Search } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { DeliveryBadge, type NotificationItem } from "@/components/notifications/notification-list";
import { formatDateTime, maskPhone } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  CONTACT_ALERT: "Contact alert",
  STATUS_UPDATE: "Status update",
  SYSTEM: "Confirmation",
};
const CHANNEL_LABEL: Record<string, string> = { SMS_SIMULATED: "SMS (simulated)", IN_APP: "In-app" };

export function NotificationHistory({ items }: { items: (NotificationItem & { studentName: string })[] }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [limit, setLimit] = React.useState(25);

  const filtered = items.filter((n) => {
    if (type && n.type !== type) return false;
    if (status && n.status !== status) return false;
    const t = q.trim().toLowerCase();
    return !t || [n.incidentCode, n.recipientName, n.studentName, n.message].join(" ").toLowerCase().includes(t);
  });

  return (
    <div>
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_auto_auto]">
        <Input aria-label="Search notifications" placeholder="Search by incident ID, recipient or student…" value={q} onChange={(e) => setQ(e.target.value)} icon={<Search className="h-4 w-4" />} />
        <Select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select aria-label="Filter by delivery status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All delivery states</option>
          <option value="DELIVERED">Delivered</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<BellRing className="h-5 w-5" />} title="No notifications found" description="Simulated notifications are generated whenever incidents are reported or updated." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Type / channel</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, limit).map((n) => (
                <tr key={n.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatDateTime(n.createdAt)}</td>
                  <td className="px-4 py-3">
                    {n.incidentId ? (
                      <Link href={`/admin/incidents/${n.incidentId}`} className="font-mono text-xs font-semibold text-royal hover:underline">{n.incidentCode}</Link>
                    ) : "—"}
                    <p className="text-xs text-slate-500">{n.studentName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-navy">{TYPE_LABEL[n.type] ?? n.type}</p>
                    <p className="text-xs text-slate-500">{CHANNEL_LABEL[n.channel] ?? n.channel}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-navy">{n.recipientName}</p>
                    {n.recipientPhone && <p className="text-xs text-slate-500">{maskPhone(n.recipientPhone)}</p>}
                  </td>
                  <td className="max-w-sm px-4 py-3 text-xs text-slate-600">{n.message}</td>
                  <td className="px-4 py-3">
                    <DeliveryBadge status={n.status} />
                    {n.deliveredAt && <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.deliveredAt)}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <span>Showing {Math.min(limit, filtered.length)} of {filtered.length}</span>
        {filtered.length > limit && (
          <button onClick={() => setLimit((l) => l + 25)} className="font-semibold text-royal hover:underline">Load more</button>
        )}
      </div>
    </div>
  );
}
