import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  CheckCircle2,
  ClipboardList,
  Lock,
  MapPin,
  ShieldCheck,
  Siren,
  Users,
  Zap,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { CategoryIcon } from "@/components/incidents/badges";
import { CATEGORIES } from "@/lib/constants";

const FEATURES = [
  { icon: Siren, title: "One-tap SOS", text: "A prominent emergency button with confirmation, instant incident ID and live status." },
  { icon: Brain, title: "AI priority engine", text: "Explainable classification into Critical, High, Medium or Low with recommended actions." },
  { icon: Users, title: "Trusted contacts", text: "Manage up to 10 contacts who receive simulated alerts the moment you report." },
  { icon: MapPin, title: "Location sharing", text: "Share coordinates only after consent – or use mock locations for demonstrations." },
  { icon: Zap, title: "Escalation workflow", text: "Security sees the right response team, escalation level and next steps automatically." },
  { icon: BarChart3, title: "Live analytics", text: "Category, priority and trend charts built from real incident records." },
];

const STEPS = [
  { n: "01", title: "Raise an alert", text: "Press SOS or fill in a detailed report with category, details and location." },
  { n: "02", title: "Auto-classified", text: "The engine scores risk, assigns priority and recommends the response." },
  { n: "03", title: "Security responds", text: "The console updates status – Under Review, Dispatched, In Progress, Resolved." },
  { n: "04", title: "You stay informed", text: "Every status change appears in your timeline and notifications." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_60%_at_80%_20%,rgba(37,99,235,.55),transparent_60%),radial-gradient(40%_40%_at_10%_90%,rgba(220,38,38,.35),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" /> Campus safety management · DIU SE331 prototype
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              Help is one tap away,
              <span className="block bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
                wherever your journey goes.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              HerShield lets students raise emergencies in seconds and gives campus security a real-time console to
              prioritise, track and resolve every incident.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={buttonClasses("danger", "xl")}>
                <Siren className="h-5 w-5" /> Create student account
              </Link>
              <Link href="/login" className={buttonClasses("secondary", "xl", "bg-white/10 text-white ring-white/20 hover:bg-white/15")}>
                Student login <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5" /> Simulation only – no real alerts, SMS or calls are sent.
            </p>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security console</p>
                  <p className="text-lg font-bold text-navy">Escalation queue</p>
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-sos ring-1 ring-red-100">3 critical</span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { slug: "physical-threat", code: "HS-1018", t: "Being followed near bus stand", p: "Critical", c: "bg-red-600 text-white" },
                  { slug: "medical", code: "HS-1017", t: "Student fainted at library stairs", p: "Critical", c: "bg-red-600 text-white" },
                  { slug: "harassment", code: "HS-1015", t: "Verbal harassment at food court", p: "Medium", c: "bg-amber-50 text-amber-800" },
                  { slug: "suspicious-activity", code: "HS-1012", t: "Unknown person near hostel gate", p: "Low", c: "bg-green-50 text-green-700" },
                ].map((r) => (
                  <div key={r.code} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <CategoryIcon slug={r.slug} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-semibold text-royal">{r.code}</p>
                      <p className="truncate text-sm font-medium text-navy">{r.t}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.c}`}>{r.p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-slate-700">
                <p className="font-semibold text-navy">Recommended: Security Escalation</p>
                Dispatch nearest patrol to shared location and guide student to a staffed building.
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">2 contacts alerted</p>
                  <p className="text-xs text-slate-500">Simulated SMS · delivered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500">Report any of eight emergency categories</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CATEGORIES.map((c) => (
              <div key={c.slug} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center">
                <CategoryIcon slug={c.slug} size="lg" />
                <span className="text-xs font-semibold text-navy">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-royal">Platform</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Everything students and security need in one place
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-50 text-royal">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-navy">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-navy">How HerShield works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-canvas p-6">
                <p className="font-mono text-sm font-bold text-royal">{s.n}</p>
                <h3 className="mt-3 font-semibold text-navy">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="bg-canvas py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-200">
            <ClipboardList className="h-8 w-8 text-royal" />
            <h3 className="mt-4 text-xl font-bold text-navy">For students</h3>
            <p className="mt-2 text-sm text-slate-600">SOS, detailed reports, trusted contacts, location sharing, report history and safety tips.</p>
            <div className="mt-6 flex gap-2">
              <Link href="/register" className={buttonClasses("primary")}>Register</Link>
              <Link href="/login" className={buttonClasses("secondary")}>Login</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-navy p-8 text-white shadow-card">
            <Bell className="h-8 w-8 text-blue-300" />
            <h3 className="mt-4 text-xl font-bold">For campus security</h3>
            <p className="mt-2 text-sm text-slate-300">Monitoring map, incident management, escalation center, analytics and notification history.</p>
            <div className="mt-6">
              <Link href="/admin/login" className={buttonClasses("secondary", "md", "bg-white")}>Security console login</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
