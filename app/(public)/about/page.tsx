import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Database, Lock, ShieldCheck, Users, Workflow } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "About HerShield" };

const PILLARS = [
  { icon: ShieldCheck, title: "Problem", text: "Students sometimes face emergencies while travelling to or from university, particularly during late hours, and need immediate assistance from campus security, trusted contacts or response personnel." },
  { icon: Workflow, title: "Solution", text: "A centralised platform where students report emergencies in seconds and authorised personnel monitor, prioritise and respond to every incident through a defined workflow." },
  { icon: Brain, title: "Intelligence", text: "A transparent rule-based engine classifies priority from category, description keywords, threat level, injury and danger indicators, then recommends the next action. An external AI API can optionally add advisory notes." },
  { icon: Lock, title: "Privacy by design", text: "Role-based access control, hashed passwords, locations visible only to the reporter and security, masked phone numbers, and fully simulated notifications." },
];

const STACK = ["Next.js 14 App Router", "React 18 + TypeScript", "Tailwind CSS", "Prisma ORM + SQLite", "JWT sessions (jose) + bcrypt", "React Leaflet + OpenStreetMap", "Recharts", "Framer Motion", "Zod validation"];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="bg-canvas py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-royal">About HerShield</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy">A safer journey for every student</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            HerShield – AI-Powered Campus Safety Management System is the capstone project for SE331 Software Engineering
            Design Capstone Project (Assessment 2), Department of Software Engineering, Daffodil International University.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-slate-200 p-6 shadow-card">
            <p.icon className="h-7 w-7 text-royal" />
            <h2 className="mt-4 text-lg font-semibold text-navy">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-slate-100 bg-canvas py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <Users className="h-7 w-7 text-royal" />
            <h2 className="mt-3 text-2xl font-bold text-navy">Two roles, one workflow</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><strong className="text-navy">Students</strong> register, manage trusted contacts, trigger SOS, submit detailed reports, share location and track status.</li>
              <li><strong className="text-navy">Campus security / admins</strong> monitor incidents on a map, review AI recommendations, update status, override priority and analyse trends.</li>
            </ul>
          </div>
          <div>
            <Database className="h-7 w-7 text-royal" />
            <h2 className="mt-3 text-2xl font-bold text-navy">Technology</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {STACK.map((s) => (
                <span key={s} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl bg-amber-50 p-6 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>Assessment note:</strong> this is a prototype. It never sends real emergency alerts, never contacts real
          emergency services and never exposes real student location data. All demo identities and locations are fictional.
        </div>
        <Link href="/register" className={buttonClasses("primary", "lg", "mt-8")}>Try the student portal</Link>
      </section>
    </div>
  );
}
