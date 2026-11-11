"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CheckCircle2, Clock, MessageSquare, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, SimulationBadge } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api-client";
import { cn, formatDateTime, maskPhone } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  recipientName: string;
  recipientPhone: string | null;
  status: string;
  isRead: boolean;
  createdAt: string;
  deliveredAt: string | null;
  incidentId: string | null;
  incidentCode: string | null;
}

export function DeliveryBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    DELIVERED: { cls: "bg-green-50 text-green-700 ring-green-200", icon: <CheckCircle2 className="h-3 w-3" />, label: "Delivered" },
    PENDING: { cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: <Clock className="h-3 w-3" />, label: "Pending" },
    FAILED: { cls: "bg-red-50 text-red-700 ring-red-200", icon: <XCircle className="h-3 w-3" />, label: "Failed" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", s.cls)}>
      {s.icon} {s.label}
    </span>
  );
}

export function StudentNotifications({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"inbox" | "contacts">("inbox");
  const [marking, setMarking] = React.useState(false);
  const inbox = items.filter((n) => n.type !== "CONTACT_ALERT");
  const contacts = items.filter((n) => n.type === "CONTACT_ALERT");
  const unread = inbox.filter((n) => !n.isRead).length;
  const list = tab === "inbox" ? inbox : contacts;

  async function markAll() {
    setMarking(true);
    const res = await apiRequest("/api/notifications", "PATCH");
    setMarking(false);
    if (res.ok) {
      toast({ title: "All notifications marked as read" });
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {[
            { id: "inbox" as const, label: `My updates (${inbox.length})` },
            { id: "contacts" as const, label: `Alerts sent to contacts (${contacts.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition",
                tab === t.id ? "bg-white text-navy shadow-sm" : "text-slate-600 hover:text-navy",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {tab === "inbox" && unread > 0 && (
            <Button variant="secondary" size="sm" onClick={markAll} loading={marking}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read ({unread})
            </Button>
          )}
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title={tab === "inbox" ? "No notifications yet" : "No contact alerts yet"}
          description={tab === "inbox" ? "Status updates on your reports will appear here." : "When you report an emergency, simulated alerts to your trusted contacts appear here."}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {list.map((n) => (
            <li key={n.id} className={cn("flex gap-4 px-5 py-4", !n.isRead && tab === "inbox" && "bg-blue-50/40")}>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  n.type === "CONTACT_ALERT" ? "bg-red-50 text-sos" : n.type === "STATUS_UPDATE" ? "bg-blue-50 text-royal" : "bg-slate-100 text-navy",
                )}
              >
                {n.type === "CONTACT_ALERT" ? <MessageSquare className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{n.title}</p>
                  {!n.isRead && tab === "inbox" && <span className="h-2 w-2 rounded-full bg-royal" aria-label="Unread" />}
                  {n.type === "CONTACT_ALERT" && <SimulationBadge />}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{formatDateTime(n.createdAt)}</span>
                  {n.type === "CONTACT_ALERT" && (
                    <>
                      <span>To {n.recipientName} · {maskPhone(n.recipientPhone)}</span>
                      <DeliveryBadge status={n.status} />
                    </>
                  )}
                  {n.incidentId && n.incidentCode && (
                    <Link href={`/student/reports/${n.incidentId}`} className="font-semibold text-royal hover:underline">
                      {n.incidentCode} →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
