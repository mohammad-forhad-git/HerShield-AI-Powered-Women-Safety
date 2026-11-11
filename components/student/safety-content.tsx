import { Flame, HeartPulse, Moon, Phone, Route, Smartphone, UserX, type LucideIcon } from "lucide-react";
import { EMERGENCY_NUMBERS, SAFETY_SECTIONS } from "@/lib/content";

const ICONS: Record<string, LucideIcon> = { Route, Moon, UserX, HeartPulse, Flame, Smartphone };

export function SafetySections() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {SAFETY_SECTIONS.map((s) => {
        const Icon = ICONS[s.icon] ?? Route;
        return (
          <section key={s.id} id={s.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-50 text-royal">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-navy">{s.title}</h2>
            </div>
            <ul className="mt-4 space-y-2.5">
              {s.tips.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function EmergencyNumbers() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {EMERGENCY_NUMBERS.map((n) => (
        <div key={n.label} className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
          <Phone className="h-5 w-5 text-sos" />
          <p className="mt-2 text-xl font-bold text-navy">{n.number}</p>
          <p className="text-sm font-medium text-slate-700">{n.label}</p>
          <p className="text-xs text-slate-500">{n.note}</p>
        </div>
      ))}
    </div>
  );
}
