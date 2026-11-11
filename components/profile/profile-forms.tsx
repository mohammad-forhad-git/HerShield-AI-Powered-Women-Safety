"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Toggle } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { fieldErrors, passwordChangeSchema, profileSchema } from "@/lib/validation";
import { apiRequest } from "@/lib/api-client";

export function ProfileForm({
  role,
  initial,
}: {
  role: "STUDENT" | "ADMIN";
  initial: {
    name: string;
    email: string;
    phone: string;
    studentId?: string;
    department?: string;
    batch?: string;
    designation?: string;
    shareLocationConsent?: boolean;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    name: initial.name,
    phone: initial.phone,
    department: initial.department ?? "",
    batch: initial.batch ?? "",
    designation: initial.designation ?? "",
    shareLocationConsent: initial.shareLocationConsent ?? false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    const res = await apiRequest("/api/profile", "PUT", form);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.data.fields ?? {});
      toast({ title: "Could not save profile", description: res.data.error, variant: "error" });
      return;
    }
    toast({ title: "Profile updated" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" htmlFor="p-name" required error={errors.name}>
        <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
      </Field>
      <Field label="Email" htmlFor="p-email" hint="Email cannot be changed.">
        <Input id="p-email" value={initial.email} disabled />
      </Field>
      <Field label="Phone number" htmlFor="p-phone" required error={errors.phone}>
        <Input id="p-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
      </Field>
      {role === "STUDENT" ? (
        <>
          <Field label="Student ID" htmlFor="p-sid" hint="Contact the registrar to change your ID.">
            <Input id="p-sid" value={initial.studentId ?? ""} disabled />
          </Field>
          <Field label="Department" htmlFor="p-dept" error={errors.department}>
            <Input id="p-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Software Engineering" />
          </Field>
          <Field label="Batch" htmlFor="p-batch" error={errors.batch}>
            <Input id="p-batch" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="e.g. 41st" />
          </Field>
          <div className="sm:col-span-2">
            <Toggle
              id="p-consent"
              checked={form.shareLocationConsent}
              onChange={(v) => setForm({ ...form, shareLocationConsent: v })}
              label="Allow location sharing during emergencies"
              description="Your browser will still ask for permission each time. Coordinates are visible only to you and campus security."
            />
          </div>
        </>
      ) : (
        <Field label="Designation" htmlFor="p-des" error={errors.designation}>
          <Input id="p-des" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
        </Field>
      )}
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" loading={saving}>
          {!saving && <Save className="h-4 w-4" />} Save changes
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { toast } = useToast();
  const [form, setForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = passwordChangeSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    const res = await apiRequest("/api/profile/password", "POST", form);
    setSaving(false);
    if (!res.ok) return setErrors(res.data.fields ?? { currentPassword: res.data.error ?? "Failed" });
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast({ title: "Password changed" });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-3">
      <Field label="Current password" htmlFor="pw-cur" error={errors.currentPassword}>
        <Input id="pw-cur" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={errors.currentPassword} />
      </Field>
      <Field label="New password" htmlFor="pw-new" error={errors.newPassword} hint="8+ chars, upper, lower & number">
        <Input id="pw-new" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={errors.newPassword} />
      </Field>
      <Field label="Confirm new password" htmlFor="pw-conf" error={errors.confirmPassword}>
        <Input id="pw-conf" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} />
      </Field>
      <div className="flex justify-end sm:col-span-3">
        <Button type="submit" variant="navy" loading={saving}>
          {!saving && <KeyRound className="h-4 w-4" />} Change password
        </Button>
      </div>
    </form>
  );
}
