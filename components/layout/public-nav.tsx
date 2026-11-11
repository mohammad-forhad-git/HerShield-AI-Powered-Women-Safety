"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety Guidelines" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === l.href ? "text-royal" : "text-slate-600 hover:text-navy",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/admin/login" className={buttonClasses("ghost", "md")}>
            Security Login
          </Link>
          <Link href="/login" className={buttonClasses("secondary", "md")}>
            Student Login
          </Link>
          <Link href="/register" className={buttonClasses("primary", "md")}>
            Get Started
          </Link>
        </div>
        <button
          className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href="/login" className={buttonClasses("secondary", "md")}>
              Student Login
            </Link>
            <Link href="/register" className={buttonClasses("primary", "md")}>
              Register
            </Link>
            <Link href="/admin/login" className={buttonClasses("ghost", "md", "col-span-2")}>
              Security / Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-md text-sm text-slate-500">
            HerShield is an AI-powered campus safety management prototype built for the DIU SE331 Software Engineering
            Design Capstone Project (Assessment 2).
          </p>
          <p className="mt-3 max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            Academic prototype: no real emergency alerts, SMS, emails or calls are sent. In a real emergency in
            Bangladesh, call 999.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/register" className="hover:text-navy">Student registration</Link></li>
            <li><Link href="/login" className="hover:text-navy">Student login</Link></li>
            <li><Link href="/admin/login" className="hover:text-navy">Security console</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/about" className="hover:text-navy">About HerShield</Link></li>
            <li><Link href="/safety" className="hover:text-navy">Safety guidelines</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} HerShield · Daffodil International University · Dept. of Software Engineering
      </div>
    </footer>
  );
}
