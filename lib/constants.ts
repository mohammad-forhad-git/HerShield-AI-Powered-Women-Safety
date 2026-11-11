// Shared constants used by the server, the client and the seed script.
// Tailwind classes live here on purpose (lib/** is in tailwind content paths).

export const APP_NAME = "HerShield";
export const SIMULATION_NOTICE =
  "Academic prototype: no real emergency alerts, SMS, emails or calls are ever sent.";

export const ROLES = ["STUDENT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/* ------------------------------ Statuses ------------------------------ */

export const STATUS_VALUES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "DISPATCHED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
] as const;
export type IncidentStatus = (typeof STATUS_VALUES)[number];

export const STATUSES: Record<
  IncidentStatus,
  { label: string; short: string; badge: string; dot: string; description: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    short: "Submitted",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-500",
    description: "Report received by HerShield and waiting for review.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    short: "Under Review",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-600",
    description: "Campus security is reviewing the report.",
  },
  DISPATCHED: {
    label: "Response Dispatched (Simulated)",
    short: "Dispatched",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-600",
    description: "A response team has been dispatched (simulation).",
  },
  IN_PROGRESS: {
    label: "In Progress",
    short: "In Progress",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    description: "Responders are handling the incident.",
  },
  RESOLVED: {
    label: "Resolved",
    short: "Resolved",
    badge: "bg-green-50 text-green-700 ring-green-200",
    dot: "bg-green-600",
    description: "The incident has been resolved and closed.",
  },
  REJECTED: {
    label: "Rejected",
    short: "Rejected",
    badge: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-600",
    description: "The report was closed without action (e.g. duplicate or invalid).",
  },
};

export const PENDING_STATUSES: IncidentStatus[] = ["SUBMITTED", "UNDER_REVIEW"];
export const ACTIVE_STATUSES: IncidentStatus[] = ["DISPATCHED", "IN_PROGRESS"];
export const OPEN_STATUSES: IncidentStatus[] = [...PENDING_STATUSES, ...ACTIVE_STATUSES];
export const CLOSED_STATUSES: IncidentStatus[] = ["RESOLVED", "REJECTED"];
/** Ordered steps of the normal response workflow (used by progress trackers). */
export const WORKFLOW_STEPS: IncidentStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "DISPATCHED",
  "IN_PROGRESS",
  "RESOLVED",
];

/* ------------------------------ Priorities ------------------------------ */

export const PRIORITY_VALUES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof PRIORITY_VALUES)[number];

export const PRIORITIES: Record<
  Priority,
  { label: string; color: string; badge: string; rank: number; target: string }
> = {
  CRITICAL: {
    label: "Critical",
    color: "#DC2626",
    badge: "bg-red-600 text-white ring-red-600",
    rank: 4,
    target: "Respond within 5 minutes",
  },
  HIGH: {
    label: "High",
    color: "#EA580C",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    rank: 3,
    target: "Respond within 15 minutes",
  },
  MEDIUM: {
    label: "Medium",
    color: "#F59E0B",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    rank: 2,
    target: "Respond within 1 hour",
  },
  LOW: {
    label: "Low",
    color: "#16A34A",
    badge: "bg-green-50 text-green-700 ring-green-200",
    rank: 1,
    target: "Review within 24 hours",
  },
};

/* ------------------------------ Categories ------------------------------ */

export const CATEGORY_SLUGS = [
  "medical",
  "harassment",
  "physical-threat",
  "accident",
  "theft",
  "suspicious-activity",
  "fire",
  "other",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORIES: {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
  color: string;
  basePriority: Priority;
  responseTeam: string;
}[] = [
  {
    slug: "medical",
    name: "Medical Emergency",
    description: "Injury, illness, fainting or any health emergency.",
    icon: "HeartPulse",
    color: "#DC2626",
    basePriority: "HIGH",
    responseTeam: "Campus Medical Centre",
  },
  {
    slug: "harassment",
    name: "Harassment",
    description: "Verbal, physical or online harassment, stalking or intimidation.",
    icon: "UserX",
    color: "#DB2777",
    basePriority: "MEDIUM",
    responseTeam: "Campus Security & Proctor Office",
  },
  {
    slug: "physical-threat",
    name: "Physical Threat",
    description: "Someone threatening, following or attacking you.",
    icon: "ShieldAlert",
    color: "#B91C1C",
    basePriority: "HIGH",
    responseTeam: "Campus Security Rapid Response",
  },
  {
    slug: "accident",
    name: "Accident",
    description: "Road, transport or on-campus accidents.",
    icon: "CarFront",
    color: "#EA580C",
    basePriority: "HIGH",
    responseTeam: "Medical Centre & Transport Office",
  },
  {
    slug: "theft",
    name: "Theft",
    description: "Stolen belongings, snatching or robbery.",
    icon: "Wallet",
    color: "#7C3AED",
    basePriority: "MEDIUM",
    responseTeam: "Campus Security Investigation",
  },
  {
    slug: "suspicious-activity",
    name: "Suspicious Activity",
    description: "Unusual behaviour, unknown persons or unattended items.",
    icon: "Eye",
    color: "#0891B2",
    basePriority: "LOW",
    responseTeam: "Security Patrol",
  },
  {
    slug: "fire",
    name: "Fire Emergency",
    description: "Fire, smoke, electrical sparks or gas smell.",
    icon: "Flame",
    color: "#F97316",
    basePriority: "HIGH",
    responseTeam: "Fire Safety Team",
  },
  {
    slug: "other",
    name: "Other",
    description: "Anything else that makes you feel unsafe.",
    icon: "HelpCircle",
    color: "#475569",
    basePriority: "LOW",
    responseTeam: "Campus Security Desk",
  },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[CATEGORIES.length - 1];
}

/* ------------------------------ Classifier inputs ------------------------------ */

export const THREAT_VALUES = ["NONE", "LOW", "MODERATE", "SEVERE"] as const;
export type ThreatLevel = (typeof THREAT_VALUES)[number];
export const THREAT_LEVELS: { value: ThreatLevel; label: string; hint: string }[] = [
  { value: "NONE", label: "No threat", hint: "No one is threatening me" },
  { value: "LOW", label: "Low", hint: "I feel uneasy or uncomfortable" },
  { value: "MODERATE", label: "Moderate", hint: "I am being threatened or followed" },
  { value: "SEVERE", label: "Severe", hint: "I am in active danger right now" },
];

export const INJURY_VALUES = ["NONE", "MINOR", "SERIOUS", "LIFE_THREATENING"] as const;
export type InjuryLevel = (typeof INJURY_VALUES)[number];
export const INJURY_LEVELS: { value: InjuryLevel; label: string }[] = [
  { value: "NONE", label: "No injury" },
  { value: "MINOR", label: "Minor injury" },
  { value: "SERIOUS", label: "Serious injury" },
  { value: "LIFE_THREATENING", label: "Life-threatening" },
];

export const LOCATION_SOURCES = ["GPS", "MANUAL", "MOCK"] as const;
export type LocationSource = (typeof LOCATION_SOURCES)[number];
export const LOCATION_SOURCE_LABEL: Record<LocationSource, string> = {
  GPS: "Device GPS (with consent)",
  MANUAL: "Picked on map",
  MOCK: "Mock demo location",
};

/* ------------------------------ Map / mock locations ------------------------------ */

/** Centre of the simulated campus map. */
export const CAMPUS_CENTER = { lat: 23.8765, lng: 90.3203 };

/** Fictional demo locations used for demonstrations (no real student data). */
export const MOCK_LOCATIONS: { id: string; label: string; lat: number; lng: number }[] = [
  { id: "gate-a", label: "Main Gate A (demo)", lat: 23.8752, lng: 90.3181 },
  { id: "knowledge-plaza", label: "Knowledge Tower Plaza (demo)", lat: 23.8771, lng: 90.3205 },
  { id: "library-walk", label: "Central Library Walkway (demo)", lat: 23.8779, lng: 90.3219 },
  { id: "hostel-junction", label: "Hostel Road Junction (demo)", lat: 23.8798, lng: 90.3236 },
  { id: "sports-field", label: "Sports Field Corner (demo)", lat: 23.8741, lng: 90.3228 },
  { id: "transport-hub", label: "Transport Hub Bus Stand (demo)", lat: 23.8729, lng: 90.3192 },
  { id: "food-court", label: "Food Court Lane (demo)", lat: 23.8762, lng: 90.3243 },
  { id: "lakeside", label: "Lakeside Path (demo)", lat: 23.8808, lng: 90.3198 },
  { id: "lab-parking", label: "Innovation Lab Parking (demo)", lat: 23.8786, lng: 90.3172 },
  { id: "ring-road", label: "Outer Ring Road Bus Stop (demo)", lat: 23.8713, lng: 90.3221 },
];

/* ------------------------------ Helpers ------------------------------ */

export function statusInfo(status: string) {
  return STATUSES[status as IncidentStatus] ?? STATUSES.SUBMITTED;
}
export function priorityInfo(priority: string) {
  return PRIORITIES[priority as Priority] ?? PRIORITIES.LOW;
}
export function isOpenStatus(status: string) {
  return OPEN_STATUSES.includes(status as IncidentStatus);
}
