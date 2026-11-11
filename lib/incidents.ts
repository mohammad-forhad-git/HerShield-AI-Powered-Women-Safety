import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { classifyIncident } from "./classifier";
import { aiAdvisoryNote } from "./ai";
import { statusInfo, priorityInfo, type IncidentStatus, type Priority } from "./constants";
import type { IncidentInput } from "./validation";

export const incidentDetailInclude = {
  category: true,
  location: true,
  reporter: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      studentProfile: { select: { studentId: true, department: true, batch: true } },
    },
  },
  statusHistory: {
    orderBy: { createdAt: "asc" },
    include: { changedBy: { select: { name: true, role: true } } },
  },
  notifications: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.IncidentInclude;

export type IncidentDetail = Prisma.IncidentGetPayload<{ include: typeof incidentDetailInclude }>;

export const incidentListInclude = {
  category: { select: { slug: true, name: true, color: true } },
  location: { select: { latitude: true, longitude: true, label: true, source: true } },
  reporter: { select: { name: true, studentProfile: { select: { studentId: true } } } },
} satisfies Prisma.IncidentInclude;

export type IncidentListItem = Prisma.IncidentGetPayload<{ include: typeof incidentListInclude }>;

/** Shape used by client tables (plain, serialisable). */
export function toRow(i: IncidentListItem) {
  return {
    id: i.id,
    code: i.code,
    title: i.title,
    categorySlug: i.category.slug,
    categoryName: i.category.name,
    priority: i.priority,
    status: i.status,
    isSos: i.isSos,
    locationText: i.locationText,
    createdAt: i.createdAt.toISOString(),
    studentName: i.reporter.name,
    studentId: i.reporter.studentProfile?.studentId ?? "",
    hasLocation: Boolean(i.location),
  };
}
export type IncidentRow = ReturnType<typeof toRow>;

/**
 * Creates an incident: classifies it, generates the HS-xxxx ID, stores location,
 * the first status-history entry, and SIMULATED notifications for trusted contacts.
 */
export async function createIncident(input: IncidentInput, reporter: { id: string; name: string }) {
  const category = await prisma.incidentCategory.findUnique({ where: { slug: input.categorySlug } });
  if (!category) throw new Error("Unknown emergency category");

  const classification = classifyIncident({
    categorySlug: input.categorySlug,
    title: input.title,
    description: input.description,
    additionalNotes: input.additionalNotes,
    threatLevel: input.threatLevel,
    injuryLevel: input.injuryLevel,
    immediateDanger: input.immediateDanger,
    isSos: input.isSos,
  });

  const aiNote = await aiAdvisoryNote({
    categoryName: category.name,
    title: input.title,
    description: input.description,
    classification,
  });

  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: reporter.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return prisma.$transaction(async (tx) => {
    const last = await tx.incident.findFirst({ orderBy: { sequence: "desc" }, select: { sequence: true } });
    const sequence = (last?.sequence ?? 1000) + 1;
    const code = `HS-${sequence}`;
    const now = new Date();

    const incident = await tx.incident.create({
      data: {
        code,
        sequence,
        title: input.title,
        description: input.description,
        categoryId: category.id,
        reporterId: reporter.id,
        locationText: input.locationText,
        occurredAt: new Date(input.occurredAt),
        additionalNotes: input.additionalNotes || null,
        reportedPriority: input.reportedPriority ?? null,
        threatLevel: input.threatLevel,
        injuryLevel: input.injuryLevel,
        immediateDanger: input.immediateDanger,
        isSos: input.isSos,
        priority: classification.priority,
        aiPriority: classification.priority,
        aiScore: classification.score,
        aiReasons: JSON.stringify(classification.reasons),
        recommendedAction: classification.recommendedAction,
        responseCategory: classification.responseCategory,
        escalationLevel: classification.escalationLevel,
        aiNote,
        status: "SUBMITTED",
        location: input.location
          ? {
              create: {
                latitude: input.location.latitude,
                longitude: input.location.longitude,
                label: input.location.label ?? null,
                source: input.location.source,
                accuracy: input.location.accuracy ?? null,
              },
            }
          : undefined,
        statusHistory: {
          create: {
            toStatus: "SUBMITTED",
            note: input.isSos
              ? `SOS alert raised by student. Auto-classified as ${priorityInfo(classification.priority).label}.`
              : `Incident report submitted. Auto-classified as ${priorityInfo(classification.priority).label}.`,
            changedById: reporter.id,
          },
        },
      },
    });

    // ---- Simulated trusted-contact alerts (nothing leaves the app) ----
    for (const [index, contact] of contacts.entries()) {
      await tx.notification.create({
        data: {
          userId: reporter.id,
          incidentId: incident.id,
          contactId: contact.id,
          type: "CONTACT_ALERT",
          channel: "SMS_SIMULATED",
          recipientName: contact.name,
          recipientPhone: contact.phone,
          title: "Emergency Alert (Simulated)",
          message: `Emergency Alert: A student has submitted a ${category.name} report. Incident ID: ${code}. Campus security has been notified.`,
          status: "DELIVERED",
          deliveredAt: new Date(now.getTime() + 1200 + index * 800),
          isRead: true,
        },
      });
    }

    // ---- In-app confirmation for the student ----
    await tx.notification.create({
      data: {
        userId: reporter.id,
        incidentId: incident.id,
        type: "SYSTEM",
        channel: "IN_APP",
        recipientName: reporter.name,
        title: `${input.isSos ? "SOS" : "Report"} ${code} received`,
        message: contacts.length
          ? `Your ${category.name} report was classified as ${priorityInfo(classification.priority).label} priority. ${contacts.length} trusted contact(s) received a simulated alert.`
          : `Your ${category.name} report was classified as ${priorityInfo(classification.priority).label} priority. Add trusted contacts so they can be alerted (simulated) next time.`,
        status: "DELIVERED",
        deliveredAt: now,
      },
    });

    return {
      incident,
      classification,
      contactsNotified: contacts.map((c) => ({ name: c.name, relationship: c.relationship, phone: c.phone })),
    };
  });
}

/** Admin status update with history + student notification. */
export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus,
  note: string | undefined,
  adminId: string,
) {
  const current = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!current) return { error: "Incident not found", code: 404 } as const;
  if (current.status === status) return { error: "Incident already has this status", code: 400 } as const;

  const label = statusInfo(status).label;
  const updated = await prisma.$transaction(async (tx) => {
    const inc = await tx.incident.update({
      where: { id: incidentId },
      data: { status, resolvedAt: status === "RESOLVED" ? new Date() : null },
    });
    await tx.incidentStatusHistory.create({
      data: { incidentId, fromStatus: current.status, toStatus: status, note: note || null, changedById: adminId },
    });
    await tx.notification.create({
      data: {
        userId: current.reporterId,
        incidentId,
        type: "STATUS_UPDATE",
        channel: "IN_APP",
        recipientName: "Student",
        title: `${current.code} is now "${label}"`,
        message: `Campus security updated incident ${current.code} from "${statusInfo(current.status).label}" to "${label}".${note ? ` Note: ${note}` : ""}`,
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });
    return inc;
  });
  return { incident: updated } as const;
}

export async function overrideIncidentPriority(
  incidentId: string,
  priority: Priority,
  reason: string,
  adminId: string,
) {
  const current = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!current) return { error: "Incident not found", code: 404 } as const;
  const updated = await prisma.$transaction(async (tx) => {
    const inc = await tx.incident.update({
      where: { id: incidentId },
      data: {
        priority,
        priorityOverridden: priority !== current.aiPriority,
        overrideReason: priority !== current.aiPriority ? reason : null,
      },
    });
    await tx.incidentStatusHistory.create({
      data: {
        incidentId,
        fromStatus: current.status,
        toStatus: current.status,
        note: `Priority changed ${priorityInfo(current.priority).label} → ${priorityInfo(priority).label}. Reason: ${reason}`,
        changedById: adminId,
      },
    });
    return inc;
  });
  return { incident: updated } as const;
}
