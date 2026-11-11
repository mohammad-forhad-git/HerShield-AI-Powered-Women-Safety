"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Hash, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";
import { apiRequest } from "@/lib/api-client";

function safeNext(next: string | undefined, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function PasswordInput({
  id,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        autoComplete={autoComplete}
        icon={<Lock className="h-4 w-4" />}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-2 flex items-center px-1 text-slate-400 hover:text-slate-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm({
  portal,
  next,
  demo,
}: {
  portal: "student" | "admin";
  next?: string;
  demo: { email: string; password: string };
}) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ email, password, portal });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    const res = await apiRequest<{ redirect: string }>("/api/auth/login", "POST", { email, password, portal });
    if (!res.ok) {
      setLoading(false);
      setErrors(res.data.fields ?? {});
      setFormError(res.data.error ?? "Login failed.");
      return;
    }
    router.push(safeNext(next, res.data.redirect));
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {formError && <Alert tone="danger" title={formError} />}
      <Field label={portal === "admin" ? "Staff email" : "University email"} htmlFor="email" required error={errors.email}>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} icon={<Mail className="h-4 w-4" />} placeholder={demo.email} />
      </Field>
      <Field label="Password" htmlFor="password" required error={errors.password}>
        <PasswordInput id="password" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
      </Field>
      <Button type="submit" size="lg" variant={portal === "admin" ? "navy" : "primary"} className="w-full" loading={loading}>
        {portal === "admin" ? "Sign in to security console" : "Sign in"}
      </Button>
      <button
        type="button"
        onClick={() => {
          setEmail(demo.email);
          setPassword(demo.password);
        }}
        className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-500 hover:border-royal hover:text-royal"
      >
        Use demo account: <span className="font-semibold">{demo.email}</span> / {demo.password}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    fullName: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    const res = await apiRequest<{ redirect: string }>("/api/auth/register", "POST", form);
    if (!res.ok) {
      setLoading(false);
      setErrors(res.data.fields ?? {});
      setFormError(res.data.error ?? "Registration failed.");
      return;
    }
    router.push("/student/contacts?welcome=1");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {formError && <Alert tone="danger" title={formError} className="sm:col-span-2" />}
      <Field label="Full name" htmlFor="fullName" required error={errors.fullName} className="sm:col-span-2">
        <Input id="fullName" autoComplete="name" value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} error={errors.fullName} icon={<User className="h-4 w-4" />} />
      </Field>
      <Field label="Student ID" htmlFor="studentId" required error={errors.studentId}>
        <Input id="studentId" value={form.studentId} onChange={(e) => set("studentId")(e.target.value)} error={errors.studentId} placeholder="221-35-1234" icon={<Hash className="h-4 w-4" />} />
      </Field>
      <Field label="Phone number" htmlFor="phone" required error={errors.phone}>
        <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} error={errors.phone} placeholder="01712345678" icon={<Phone className="h-4 w-4" />} />
      </Field>
      <Field label="University email" htmlFor="email" required error={errors.email} className="sm:col-span-2">
        <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} placeholder="name@diu.edu.bd" icon={<Mail className="h-4 w-4" />} />
      </Field>
      <Field label="Department (optional)" htmlFor="department" className="sm:col-span-2">
        <Input id="department" value={form.department} onChange={(e) => set("department")(e.target.value)} placeholder="Software Engineering" />
      </Field>
      <Field label="Password" htmlFor="password" required error={errors.password} hint="8+ characters with upper, lower case and a number">
        <PasswordInput id="password" value={form.password} onChange={set("password")} error={errors.password} autoComplete="new-password" />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
        <PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} autoComplete="new-password" />
      </Field>
      <Button type="submit" size="lg" className="w-full sm:col-span-2" loading={loading}>
        Create account
      </Button>
      <p className="text-xs text-slate-500 sm:col-span-2">
        By registering you agree that this is an academic prototype – use fictional data only.
      </p>
    </form>
  );
}
