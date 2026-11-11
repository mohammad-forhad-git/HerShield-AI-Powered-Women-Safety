import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  title,
  subtitle,
  children,
  variant = "student",
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  variant?: "student" | "admin";
  footer?: React.ReactNode;
}) {
  const admin = variant === "admin";
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div
          className={
            admin
              ? "absolute inset-0 [background:radial-gradient(60%_50%_at_30%_30%,rgba(37,99,235,.45),transparent_60%)]"
              : "absolute inset-0 [background:radial-gradient(60%_50%_at_70%_30%,rgba(37,99,235,.5),transparent_60%),radial-gradient(40%_40%_at_20%_90%,rgba(220,38,38,.35),transparent_60%)]"
          }
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
              {admin ? "Campus Security Console" : "Student Safety Portal"}
            </p>
            <h2 className="mt-3 max-w-md text-4xl font-bold leading-tight text-white">
              {admin ? "Monitor, prioritise and respond to every incident." : "Your safety network, always one tap away."}
            </h2>
            <ul className="mt-8 space-y-3 text-slate-300">
              {(admin
                ? ["Live incident map with priority markers", "AI escalation recommendations", "Status workflow with full audit trail"]
                : ["One-tap SOS with instant incident ID", "Trusted contacts alerted (simulated)", "Track every response in real time"]
              ).map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-400">Academic prototype · DIU SE331 · No real alerts are sent.</p>
        </div>
      </div>
      <div className="flex flex-col bg-white">
        <div className="flex h-16 items-center justify-between px-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
            <p className="mt-10 text-center text-xs text-slate-400">
              <Link href="/" className="hover:text-navy">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
