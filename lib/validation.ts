import { z } from "zod";
import {
  CATEGORY_SLUGS,
  INJURY_VALUES,
  LOCATION_SOURCES,
  PRIORITY_VALUES,
  STATUS_VALUES,
  THREAT_VALUES,
} from "./constants";

export const STUDENT_ID_REGEX = /^\d{3}-\d{2}-\d{3,5}$/;
export const BD_PHONE_REGEX = /^(\+?880|0)1[3-9]\d{8}$/;
export const UNIVERSITY_EMAIL_REGEX = /^[^\s@]+@([a-z0-9-]+\.)*(edu|ac)(\.[a-z]{2})?$/i;

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => BD_PHONE_REGEX.test(v), "Enter a valid Bangladeshi mobile number (e.g. 01712345678)");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/\d/, "Include at least one number");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Full name must be at least 3 characters").max(80),
    studentId: z
      .string()
      .trim()
      .regex(STUDENT_ID_REGEX, "Use the DIU format, e.g. 221-35-1234"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email")
      .regex(UNIVERSITY_EMAIL_REGEX, "Use your university email (e.g. name@diu.edu.bd)"),
    phone,
    department: z.string().trim().max(80).optional().or(z.literal("")),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  portal: z.enum(["student", "admin"]).default("student"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  phone,
  relationship: z.string().trim().min(2, "Relationship is required").max(40),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  isPrimary: z.boolean().optional().default(false),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().trim().max(120).optional().nullable(),
  source: z.enum(LOCATION_SOURCES),
  accuracy: z.number().nonnegative().optional().nullable(),
});

export const incidentSchema = z.object({
  categorySlug: z.enum(CATEGORY_SLUGS, { errorMap: () => ({ message: "Select an emergency category" }) }),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(10, "Describe what happened (at least 10 characters)").max(2000),
  locationText: z.string().trim().min(2, "Incident location is required").max(160),
  occurredAt: z
    .string()
    .min(1, "Date and time are required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date and time")
    .refine((v) => Date.parse(v) <= Date.now() + 5 * 60 * 1000, "Date and time cannot be in the future"),
  additionalNotes: z.string().trim().max(1000).optional().or(z.literal("")),
  reportedPriority: z.enum(PRIORITY_VALUES).optional().nullable(),
  threatLevel: z.enum(THREAT_VALUES).default("NONE"),
  injuryLevel: z.enum(INJURY_VALUES).default("NONE"),
  immediateDanger: z.boolean().default(false),
  isSos: z.boolean().default(false),
  location: locationSchema.optional().nullable(),
});
export type IncidentInput = z.infer<typeof incidentSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(STATUS_VALUES),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const priorityOverrideSchema = z.object({
  priority: z.enum(PRIORITY_VALUES),
  reason: z.string().trim().min(5, "Give a short reason (min 5 characters)").max(300),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(80),
  phone,
  department: z.string().trim().max(80).optional().or(z.literal("")),
  batch: z.string().trim().max(40).optional().or(z.literal("")),
  designation: z.string().trim().max(80).optional().or(z.literal("")),
  shareLocationConsent: z.boolean().optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

/** Flatten zod errors into { field: message } for forms. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
