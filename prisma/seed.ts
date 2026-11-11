/* HerShield demo data – ALL identities and locations are fictional.
 * Run with: npm run db:seed (or `npm run setup` for first-time setup). */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { classifyIncident } from "../lib/classifier";
import { CATEGORIES, MOCK_LOCATIONS, STATUSES, priorityInfo, type IncidentStatus } from "../lib/constants";

const prisma = new PrismaClient();

const STUDENT_PASSWORD = "Student@123";
const ADMIN_PASSWORD = "Admin@123";

const STUDENTS = [
  { name: "Ayesha Rahman", sid: "221-35-1001", email: "ayesha.rahman@diu.edu.bd", phone: "01710000001", dept: "Software Engineering", batch: "38th" },
  { name: "Nusrat Jahan", sid: "221-35-1002", email: "nusrat.jahan@diu.edu.bd", phone: "01710000002", dept: "Software Engineering", batch: "38th" },
  { name: "Tasnim Akter", sid: "222-15-1003", email: "tasnim.akter@diu.edu.bd", phone: "01710000003", dept: "Computer Science & Engineering", batch: "40th" },
  { name: "Farhana Islam", sid: "221-15-1004", email: "farhana.islam@diu.edu.bd", phone: "01710000004", dept: "Computer Science & Engineering", batch: "39th" },
  { name: "Sadia Hossain", sid: "223-11-1005", email: "sadia.hossain@diu.edu.bd", phone: "01710000005", dept: "Business Administration", batch: "42nd" },
  { name: "Maliha Chowdhury", sid: "222-35-1006", email: "maliha.chowdhury@diu.edu.bd", phone: "01710000006", dept: "Software Engineering", batch: "40th" },
  { name: "Raisa Karim", sid: "223-35-1007", email: "raisa.karim@diu.edu.bd", phone: "01710000007", dept: "Software Engineering", batch: "41st" },
  { name: "Sumaiya Haque", sid: "221-19-1008", email: "sumaiya.haque@diu.edu.bd", phone: "01710000008", dept: "English", batch: "38th" },
  { name: "Tanjila Sultana", sid: "222-24-1009", email: "tanjila.sultana@diu.edu.bd", phone: "01710000009", dept: "Pharmacy", batch: "40th" },
  { name: "Mehjabin Noor", sid: "223-15-1010", email: "mehjabin.noor@diu.edu.bd", phone: "01710000010", dept: "Computer Science & Engineering", batch: "41st" },
];

const ADMINS = [
  { name: "Imran Hossain", email: "security@diu.edu.bd", phone: "01810000001", designation: "Chief Security Officer" },
  { name: "Dr. Kamal Uddin", email: "admin@diu.edu.bd", phone: "01810000002", designation: "Campus Safety Administrator" },
];

// contacts per student index (Raisa – index 6 – intentionally has none to demo the empty state)
const CONTACTS: Record<number, { name: string; phone: string; relationship: string }[]> = {
  0: [
    { name: "Rokeya Rahman", phone: "01910000101", relationship: "Mother" },
    { name: "Tahmid Rahman", phone: "01910000102", relationship: "Brother" },
  ],
  1: [
    { name: "Shahana Begum", phone: "01910000201", relationship: "Mother" },
    { name: "Lamia Ferdous", phone: "01910000202", relationship: "Roommate" },
  ],
  2: [
    { name: "Abdul Akter", phone: "01910000301", relationship: "Father" },
    { name: "Priya Saha", phone: "01910000302", relationship: "Friend" },
  ],
  3: [
    { name: "Nasima Islam", phone: "01910000401", relationship: "Mother" },
    { name: "Rafiq Islam", phone: "01910000402", relationship: "Father" },
  ],
  4: [{ name: "Jamal Hossain", phone: "01910000501", relationship: "Father" }, { name: "Mitu Hossain", phone: "01910000502", relationship: "Sister" }],
  5: [{ name: "Farida Chowdhury", phone: "01910000601", relationship: "Mother" }, { name: "Anika Das", phone: "01910000602", relationship: "Roommate" }],
  7: [{ name: "Hasina Haque", phone: "01910000801", relationship: "Mother" }, { name: "Sabbir Haque", phone: "01910000802", relationship: "Guardian" }],
  8: [{ name: "Selina Sultana", phone: "01910000901", relationship: "Mother" }, { name: "Nadia Afrin", phone: "01910000902", relationship: "Friend" }],
  9: [{ name: "Kohinoor Noor", phone: "01910001001", relationship: "Mother" }],
};

interface Spec {
  s: number;
  cat: string;
  title: string;
  desc: string;
  loc: string | null;
  days: number;
  hours?: number;
  threat?: string;
  injury?: string;
  danger?: boolean;
  sos?: boolean;
  flow: { to: IncidentStatus; note: string }[];
  override?: { priority: string; reason: string };
}

const SPECS: Spec[] = [
  { s: 0, cat: "physical-threat", title: "Being followed near Transport Hub", desc: "Two men have been following me from the bus stand for 10 minutes and are threatening me right now. I am alone and scared.", loc: "transport-hub", days: 0, hours: 1, threat: "SEVERE", danger: true, sos: true, flow: [] },
  { s: 1, cat: "medical", title: "Student fainted at library stairs", desc: "My classmate collapsed on the library stairs and hit her head. There is bleeding and she is not responding properly.", loc: "library-walk", days: 0, hours: 3, injury: "SERIOUS", flow: [
    { to: "UNDER_REVIEW", note: "Medical desk informed." },
    { to: "DISPATCHED", note: "Campus medical team dispatched to the library (simulated)." },
  ] },
  { s: 9, cat: "accident", title: "Slipped on wet stairs", desc: "I slipped on the wet stairs of Knowledge Tower and hurt my ankle. Pain when walking.", loc: "knowledge-plaza", days: 0, hours: 6, injury: "MINOR", flow: [{ to: "UNDER_REVIEW", note: "First-aider contacted." }] },
  { s: 2, cat: "harassment", title: "Verbal harassment at food court", desc: "A group of outsiders keep making comments at me near the food court. No immediate threat, I moved away from them.", loc: "food-court", days: 1, threat: "LOW", flow: [{ to: "UNDER_REVIEW", note: "Reviewing CCTV for the food court area." }] },
  { s: 3, cat: "suspicious-activity", title: "Unknown person near hostel gate", desc: "Noticed an unknown man taking photos of students near the hostel gate for a long time.", loc: "hostel-junction", days: 2, flow: [] },
  { s: 4, cat: "theft", title: "Phone snatched at ring road bus stop", desc: "A bike rider snatched my phone at the bus stop. I am not injured but shaken.", loc: "ring-road", days: 3, threat: "MODERATE", flow: [
    { to: "UNDER_REVIEW", note: "Case opened." },
    { to: "IN_PROGRESS", note: "Coordinating with local police on CCTV footage (simulated)." },
  ] },
  { s: 5, cat: "accident", title: "Rickshaw collision on campus road", desc: "A rickshaw hit my friend near Gate A. She has a minor injury on her leg, bleeding a little.", loc: "gate-a", days: 5, injury: "MINOR", flow: [
    { to: "UNDER_REVIEW", note: "" },
    { to: "DISPATCHED", note: "First-aid team sent to Gate A (simulated)." },
    { to: "IN_PROGRESS", note: "Wound dressed on site." },
    { to: "RESOLVED", note: "Student treated at the medical centre and sent home." },
  ] },
  { s: 6, cat: "fire", title: "Smoke from electrical room", desc: "Smoke coming from the electrical room at the innovation lab parking, smell of burning wires.", loc: "lab-parking", days: 9, flow: [
    { to: "UNDER_REVIEW", note: "" },
    { to: "DISPATCHED", note: "Fire safety team dispatched; power isolated (simulated)." },
    { to: "RESOLVED", note: "Faulty breaker replaced. Area certified safe." },
  ] },
  { s: 7, cat: "harassment", title: "Being stalked after evening classes", desc: "A senior student keeps following me after evening classes and sends messages. I feel unsafe walking alone at night.", loc: "lakeside", days: 14, threat: "MODERATE", flow: [
    { to: "UNDER_REVIEW", note: "Proctor Office informed." },
    { to: "DISPATCHED", note: "Escort arranged for evening classes (simulated)." },
    { to: "IN_PROGRESS", note: "Disciplinary inquiry opened." },
    { to: "RESOLVED", note: "Inquiry concluded; no-contact order issued." },
  ], override: { priority: "HIGH", reason: "Repeated stalking pattern – escalated by proctor." } },
  { s: 8, cat: "medical", title: "Severe allergic reaction in class", desc: "A student is having difficulty breathing after eating peanuts, she can't breathe properly.", loc: "knowledge-plaza", days: 21, injury: "LIFE_THREATENING", sos: true, danger: true, flow: [
    { to: "DISPATCHED", note: "Medical team and ambulance dispatched (simulated)." },
    { to: "IN_PROGRESS", note: "Epinephrine administered by medical officer." },
    { to: "RESOLVED", note: "Student stable and transferred to hospital (simulated)." },
  ] },
  { s: 9, cat: "other", title: "Street lights not working on lakeside path", desc: "Lights on the lakeside path are not working, it is very dark at night. Just reporting.", loc: "lakeside", days: 28, flow: [
    { to: "UNDER_REVIEW", note: "Forwarded to estate office." },
    { to: "RESOLVED", note: "Lights repaired." },
  ] },
  { s: 0, cat: "suspicious-activity", title: "Unattended bag at sports field", desc: "Noticed an unattended black bag near the sports field corner.", loc: "sports-field", days: 35, flow: [
    { to: "UNDER_REVIEW", note: "Patrol sent to check." },
    { to: "REJECTED", note: "Owner identified – false alarm." },
  ] },
  { s: 1, cat: "theft", title: "Laptop stolen from reading room", desc: "My laptop was stolen yesterday from the library reading room. No one was hurt.", loc: "library-walk", days: 48, flow: [
    { to: "UNDER_REVIEW", note: "" },
    { to: "IN_PROGRESS", note: "CCTV review in progress." },
    { to: "RESOLVED", note: "Laptop recovered and returned to student." },
  ] },
  { s: 2, cat: "physical-threat", title: "Aggressive person at transport hub", desc: "A drunk man was shouting and threatening students at the transport hub late at night.", loc: "transport-hub", days: 62, threat: "MODERATE", flow: [
    { to: "DISPATCHED", note: "Security patrol dispatched (simulated)." },
    { to: "RESOLVED", note: "Person removed from campus premises." },
  ] },
  { s: 3, cat: "accident", title: "University bus minor accident", desc: "University bus had a minor accident near the ring road, several students hurt, one has a fracture.", loc: "ring-road", days: 75, injury: "SERIOUS", flow: [
    { to: "DISPATCHED", note: "Medical and transport teams dispatched (simulated)." },
    { to: "IN_PROGRESS", note: "Injured students transported to medical centre." },
    { to: "RESOLVED", note: "All students treated; transport office report filed." },
  ] },
  { s: 4, cat: "harassment", title: "Online harassment from fake account", desc: "Someone created a fake account using my photos and is sending me threatening messages.", loc: null, days: 90, threat: "LOW", flow: [
    { to: "UNDER_REVIEW", note: "" },
    { to: "IN_PROGRESS", note: "Cyber cell consulted (simulated)." },
    { to: "RESOLVED", note: "Account reported and removed." },
  ] },
  { s: 5, cat: "medical", title: "Fainted due to heat at sports field", desc: "I felt dizzy and fainted during practice. Feeling better now.", loc: "sports-field", days: 110, injury: "MINOR", flow: [
    { to: "DISPATCHED", note: "First-aider dispatched (simulated)." },
    { to: "RESOLVED", note: "Student rehydrated and rested." },
  ] },
  { s: 6, cat: "other", title: "Lost student ID card", desc: "I misplaced my ID card somewhere around the food court. Just reporting.", loc: null, days: 128, flow: [
    { to: "REJECTED", note: "Not a safety incident – redirected to the registrar office." },
  ] },
  { s: 7, cat: "physical-threat", title: "Attacked near outer ring road", desc: "I was grabbed and attacked by a stranger near the bus stop, managed to escape but hurt my arm.", loc: "ring-road", days: 145, injury: "MINOR", danger: true, sos: true, flow: [
    { to: "DISPATCHED", note: "Rapid response patrol dispatched (simulated)." },
    { to: "IN_PROGRESS", note: "Statement recorded; police informed (simulated)." },
    { to: "RESOLVED", note: "Follow-up counselling arranged." },
  ] },
];

async function main() {
  console.log("Clearing existing data…");
  await prisma.notification.deleteMany();
  await prisma.incidentStatusHistory.deleteMany();
  await prisma.incidentLocation.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.incidentCategory.deleteMany();

  console.log("Creating categories…");
  const categoryIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const row = await prisma.incidentCategory.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        basePriority: c.basePriority,
        responseTeam: c.responseTeam,
      },
    });
    categoryIds[c.slug] = row.id;
  }

  console.log("Creating accounts…");
  const [studentHash, adminHash] = await Promise.all([
    bcrypt.hash(STUDENT_PASSWORD, 10),
    bcrypt.hash(ADMIN_PASSWORD, 10),
  ]);
  const now = Date.now();

  const admins = await Promise.all(
    ADMINS.map((a) =>
      prisma.user.create({
        data: { ...a, role: "ADMIN", passwordHash: adminHash, lastLoginAt: new Date(now - 3600000) },
      }),
    ),
  );

  const students = await Promise.all(
    STUDENTS.map((s, i) =>
      prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: "STUDENT",
        passwordHash: studentHash,
        createdAt: new Date(now - (160 - i * 3) * 86400000),
        studentProfile: {
          create: { studentId: s.sid, department: s.dept, batch: s.batch, shareLocationConsent: i % 3 !== 2 },
        },
        contacts: {
          create: (CONTACTS[i] ?? []).map((c, idx) => ({ ...c, isPrimary: idx === 0 })),
        },
      },
      include: { contacts: { orderBy: { isPrimary: "desc" } } },
    }),
    ),
  );

  console.log("Creating incidents…");
  let sequence = 1000;
  for (const [idx, spec] of SPECS.entries()) {
    sequence += 1;
    const code = `HS-${sequence}`;
    const student = students[spec.s];
    const category = CATEGORIES.find((c) => c.slug === spec.cat)!;
    const createdAt = new Date(now - spec.days * 86400000 - (spec.hours ?? 4 + (idx % 6)) * 3600000);
    const cls = classifyIncident({
      categorySlug: spec.cat,
      title: spec.title,
      description: spec.desc,
      threatLevel: spec.threat ?? "NONE",
      injuryLevel: spec.injury ?? "NONE",
      immediateDanger: spec.danger ?? false,
      isSos: spec.sos ?? false,
    });

    // status timeline offsets (minutes after creation) – kept short for very recent incidents
    const recent = spec.days === 0;
    const offsets = recent ? [6, 14, 25, 40] : [9, 25, 90, 360];
    const finalStatus = spec.flow.length ? spec.flow[spec.flow.length - 1].to : "SUBMITTED";
    const lastChange = spec.flow.length ? new Date(createdAt.getTime() + offsets[spec.flow.length - 1] * 60000) : createdAt;
    const effectivePriority = spec.override?.priority ?? cls.priority;
    const mock = spec.loc ? MOCK_LOCATIONS.find((m) => m.id === spec.loc)! : null;
    const jitter = ((idx % 5) - 2) * 0.00025;
    const adminFor = (k: number) => admins[k % admins.length];

    const incident = await prisma.incident.create({
      data: {
        code,
        sequence,
        title: spec.title,
        description: spec.desc,
        categoryId: categoryIds[spec.cat],
        reporterId: student.id,
        locationText: mock ? mock.label.replace(" (demo)", "") : "Not specified",
        occurredAt: new Date(createdAt.getTime() - 5 * 60000),
        threatLevel: spec.threat ?? "NONE",
        injuryLevel: spec.injury ?? "NONE",
        immediateDanger: spec.danger ?? false,
        isSos: spec.sos ?? false,
        reportedPriority: idx % 4 === 0 ? cls.priority : null,
        priority: effectivePriority,
        aiPriority: cls.priority,
        aiScore: cls.score,
        aiReasons: JSON.stringify(cls.reasons),
        recommendedAction: cls.recommendedAction,
        responseCategory: cls.responseCategory,
        escalationLevel: cls.escalationLevel,
        priorityOverridden: Boolean(spec.override && spec.override.priority !== cls.priority),
        overrideReason: spec.override && spec.override.priority !== cls.priority ? spec.override.reason : null,
        status: finalStatus,
        resolvedAt: finalStatus === "RESOLVED" ? lastChange : null,
        createdAt,
        updatedAt: lastChange,
        location: mock
          ? {
              create: {
                latitude: Number((mock.lat + jitter).toFixed(6)),
                longitude: Number((mock.lng - jitter).toFixed(6)),
                label: mock.label,
                source: idx % 3 === 0 ? "MANUAL" : "MOCK",
                sharedAt: createdAt,
              },
            }
          : undefined,
      },
    });

    // status history
    await prisma.incidentStatusHistory.create({
      data: {
        incidentId: incident.id,
        toStatus: "SUBMITTED",
        note: `${spec.sos ? "SOS alert raised by student" : "Incident report submitted"}. Auto-classified as ${priorityInfo(cls.priority).label}.`,
        changedById: student.id,
        createdAt,
      },
    });
    let prev: IncidentStatus = "SUBMITTED";
    for (const [k, step] of spec.flow.entries()) {
      const at = new Date(createdAt.getTime() + offsets[k] * 60000);
      const admin = adminFor(idx + k);
      await prisma.incidentStatusHistory.create({
        data: { incidentId: incident.id, fromStatus: prev, toStatus: step.to, note: step.note || null, changedById: admin.id, createdAt: at },
      });
      await prisma.notification.create({
        data: {
          userId: student.id,
          incidentId: incident.id,
          type: "STATUS_UPDATE",
          channel: "IN_APP",
          recipientName: student.name,
          title: `${code} is now "${STATUSES[step.to].label}"`,
          message: `Campus security updated incident ${code} from "${STATUSES[prev].label}" to "${STATUSES[step.to].label}".${step.note ? ` Note: ${step.note}` : ""}`,
          status: "DELIVERED",
          isRead: spec.days > 2,
          createdAt: at,
          deliveredAt: at,
        },
      });
      prev = step.to;
    }
    if (spec.override && spec.override.priority !== cls.priority) {
      await prisma.incidentStatusHistory.create({
        data: {
          incidentId: incident.id,
          fromStatus: finalStatus,
          toStatus: finalStatus,
          note: `Priority changed ${priorityInfo(cls.priority).label} → ${priorityInfo(spec.override.priority).label}. Reason: ${spec.override.reason}`,
          changedById: admins[0].id,
          createdAt: new Date(createdAt.getTime() + 20 * 60000),
        },
      });
    }

    // simulated trusted-contact alerts + confirmation
    for (const [k, c] of student.contacts.entries()) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          incidentId: incident.id,
          contactId: c.id,
          type: "CONTACT_ALERT",
          channel: "SMS_SIMULATED",
          recipientName: c.name,
          recipientPhone: c.phone,
          title: "Emergency Alert (Simulated)",
          message: `Emergency Alert: A student has submitted a ${category.name} report. Incident ID: ${code}. Campus security has been notified.`,
          status: idx === 5 && k === 1 ? "FAILED" : "DELIVERED",
          isRead: true,
          createdAt,
          deliveredAt: idx === 5 && k === 1 ? null : new Date(createdAt.getTime() + 1500 + k * 900),
        },
      });
    }
    await prisma.notification.create({
      data: {
        userId: student.id,
        incidentId: incident.id,
        type: "SYSTEM",
        channel: "IN_APP",
        recipientName: student.name,
        title: `${spec.sos ? "SOS" : "Report"} ${code} received`,
        message: `Your ${category.name} report was classified as ${priorityInfo(cls.priority).label} priority. ${student.contacts.length} trusted contact(s) received a simulated alert.`,
        status: "DELIVERED",
        isRead: spec.days > 0,
        createdAt,
        deliveredAt: createdAt,
      },
    });
  }

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.incident.count(),
    prisma.emergencyContact.count(),
    prisma.notification.count(),
  ]);
  console.log(`Done: ${counts[0]} users, ${counts[1]} incidents, ${counts[2]} contacts, ${counts[3]} notifications.`);
  console.log("\nDemo logins:");
  console.log(`  Student: ${STUDENTS[0].email} / ${STUDENT_PASSWORD}`);
  console.log(`  Admin:   ${ADMINS[0].email} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
