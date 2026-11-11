"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Phone, Plus, Star, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Toggle } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { apiRequest } from "@/lib/api-client";
import { initials } from "@/lib/utils";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  email: string | null;
  isPrimary: boolean;
}

const RELATIONSHIPS = ["Mother", "Father", "Sister", "Brother", "Guardian", "Spouse", "Friend", "Roommate", "Relative", "Mentor", "Other"];

const EMPTY = { name: "", phone: "", relationship: "", email: "", isPrimary: false };

export function ContactsManager({ initial }: { initial: Contact[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [contacts, setContacts] = React.useState(initial);
  const [editing, setEditing] = React.useState<Contact | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Contact | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  React.useEffect(() => setContacts(initial), [initial]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY, isPrimary: contacts.length === 0 });
    setErrors({});
    setFormOpen(true);
  }
  function openEdit(c: Contact) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, relationship: c.relationship, email: c.email ?? "", isPrimary: c.isPrimary });
    setErrors({});
    setFormOpen(true);
  }

  async function save() {
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setSaving(true);
    const res = editing
      ? await apiRequest(`/api/contacts/${editing.id}`, "PUT", form)
      : await apiRequest("/api/contacts", "POST", form);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.data.fields ?? { form: res.data.error ?? "Could not save contact." });
      return;
    }
    setFormOpen(false);
    toast({ title: editing ? "Contact updated" : "Contact added", description: form.name });
    router.refresh();
  }

  async function remove() {
    if (!deleting) return;
    setDeleteLoading(true);
    const res = await apiRequest(`/api/contacts/${deleting.id}`, "DELETE");
    setDeleteLoading(false);
    if (!res.ok) return toast({ title: "Delete failed", description: res.data.error, variant: "error" });
    setContacts((cs) => cs.filter((c) => c.id !== deleting.id));
    toast({ title: "Contact removed", description: deleting.name });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Your trusted contacts"
          description={`${contacts.length} of 10 saved · they receive simulated alerts when you report an emergency.`}
          icon={<Users className="h-5 w-5" />}
          action={
            <Button onClick={openAdd} size="md">
              <Plus className="h-4 w-4" /> Add contact
            </Button>
          }
        />
        {contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No trusted contacts yet"
            description="Add family members or friends who should be alerted if you trigger an SOS."
            action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add your first contact</Button>}
          />
        ) : (
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal-50 text-sm font-bold text-royal">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-semibold text-navy">
                    {c.name}
                    {c.isPrimary && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 ring-1 ring-amber-200">
                        <Star className="h-2.5 w-2.5 fill-current" /> Primary
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{c.relationship}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {c.phone}
                  </p>
                  {c.email && <p className="truncate text-xs text-slate-500">{c.email}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`} className="text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        )}
      </Card>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit trusted contact" : "Add trusted contact"}
        description="This person will receive a simulated alert when you report an emergency."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing ? "Save changes" : "Add contact"}</Button>
          </>
        }
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          noValidate
        >
          {errors.form && <p className="text-sm font-medium text-red-600 sm:col-span-2">{errors.form}</p>}
          <Field label="Full name" htmlFor="c-name" required error={errors.name} className="sm:col-span-2">
            <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} autoFocus />
          </Field>
          <Field label="Phone number" htmlFor="c-phone" required error={errors.phone}>
            <Input id="c-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} placeholder="01712345678" />
          </Field>
          <Field label="Relationship" htmlFor="c-rel" required error={errors.relationship}>
            <Select id="c-rel" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} error={errors.relationship}>
              <option value="">Select…</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              {form.relationship && !RELATIONSHIPS.includes(form.relationship) && <option value={form.relationship}>{form.relationship}</option>}
            </Select>
          </Field>
          <Field label="Email (optional)" htmlFor="c-email" error={errors.email} className="sm:col-span-2">
            <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          </Field>
          <div className="sm:col-span-2">
            <Toggle id="c-primary" checked={form.isPrimary} onChange={(v) => setForm({ ...form, isPrimary: v })} label="Primary contact" description="Listed first and alerted first." />
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        tone="danger"
        icon={<Trash2 className="h-6 w-6" />}
        title="Remove trusted contact?"
        description={deleting ? `${deleting.name} will no longer receive alerts from your emergency reports.` : ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove} loading={deleteLoading}>Remove</Button>
          </>
        }
      />
    </>
  );
}
