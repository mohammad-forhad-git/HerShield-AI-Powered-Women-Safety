/**
 * HerShield Incident Priority Classification & Escalation Engine
 * ---------------------------------------------------------------
 * A transparent, rule-based "intelligent" engine that runs locally with no paid API.
 * It combines:
 *   1. a category base score,
 *   2. NLP-style keyword signal detection on the title/description/notes,
 *   3. structured inputs (threat level, injury level, immediate danger, SOS),
 *   4. explicit escalation rules (e.g. Medical + severe injury => Critical),
 * and produces a priority, explainable reasons, a recommended action and an
 * escalation workflow (response category, level, team, steps, target time).
 *
 * PROTOTYPE ONLY – this is not a validated real-world emergency assessment tool.
 * The same pure function runs on the server (authoritative) and in the browser
 * (live preview), so it must not import any server-only code.
 */
import {
  CATEGORIES,
  PRIORITIES,
  type CategorySlug,
  type InjuryLevel,
  type Priority,
  type ThreatLevel,
} from "./constants";

export interface ClassifierInput {
  categorySlug: string;
  title?: string;
  description?: string;
  additionalNotes?: string | null;
  threatLevel?: ThreatLevel | string;
  injuryLevel?: InjuryLevel | string;
  immediateDanger?: boolean;
  isSos?: boolean;
}

export interface Classification {
  priority: Priority;
  score: number;
  reasons: string[];
  signals: string[];
  recommendedAction: string;
  responseCategory: string;
  responseTeam: string;
  escalationLevel: string;
  targetResponse: string;
  steps: string[];
}

/* ---------------------------- signal dictionaries ---------------------------- */

interface SignalGroup {
  key: string;
  label: string;
  weight: number;
  terms: string[];
}

const SIGNALS: SignalGroup[] = [
  {
    key: "life",
    label: "life-threatening indicator",
    weight: 35,
    terms: [
      "unconscious", "not breathing", "can't breathe", "cannot breathe", "cant breathe",
      "heavy bleeding", "bleeding heavily", "severe bleeding", "heart attack", "seizure",
      "stabbed", "gun", "knife", "weapon", "overdose", "collapsed", "choking",
      "severe injury", "severely injured", "critical condition", "head injury", "not responding",
    ],
  },
  {
    key: "danger",
    label: "immediate danger indicator",
    weight: 25,
    terms: [
      "attacking", "attacked", "assault", "following me", "being followed", "chasing",
      "threatening me", "threatened me", "trapped", "kidnap", "abduct", "grabbed", "hit me",
      "beating", "right now", "happening now", "help me", "fire spreading", "flames",
      "explosion", "smoke everywhere", "won't let me leave", "cornered",
    ],
  },
  {
    key: "injury",
    label: "injury mentioned",
    weight: 12,
    terms: [
      "injured", "injury", "bleeding", "broken", "fracture", "wound", "hurt", "pain",
      "burn", "burned", "fainted", "dizzy", "sprain", "fell down", "vomiting",
    ],
  },
  {
    key: "distress",
    label: "distress / vulnerability cue",
    weight: 8,
    terms: [
      "scared", "afraid", "unsafe", "panic", "alone", "dark", "late night", "night",
      "isolated", "crying", "stalking", "stalker", "touched", "groped", "smoke",
    ],
  },
  {
    key: "deescalate",
    label: "low-risk indicator",
    weight: -12,
    terms: [
      "no immediate threat", "no injury", "not injured", "already left", "safe now",
      "i am safe", "i'm safe", "yesterday", "last week", "lost", "misplaced", "noticed",
      "just reporting", "for information", "no one was hurt", "nobody was hurt",
    ],
  },
];

const CATEGORY_BASE: Record<CategorySlug, number> = {
  medical: 45,
  "physical-threat": 50,
  fire: 55,
  accident: 42,
  harassment: 35,
  theft: 25,
  "suspicious-activity": 15,
  other: 20,
};

const THREAT_WEIGHT: Record<string, number> = { NONE: 0, LOW: 5, MODERATE: 14, SEVERE: 28 };
const INJURY_WEIGHT: Record<string, number> = { NONE: 0, MINOR: 8, SERIOUS: 25, LIFE_THREATENING: 40 };

/* ---------------------------- response playbooks ---------------------------- */

const PLAYBOOK: Record<
  CategorySlug,
  { responseCategory: string; urgent: string; standard: string; steps: string[] }
> = {
  medical: {
    responseCategory: "Medical Response",
    urgent:
      "Dispatch the campus medical team immediately and alert campus security to escort responders (simulated). Keep the student reachable until help arrives.",
    standard:
      "Contact the student to assess symptoms and arrange a visit to the campus medical centre.",
    steps: [
      "Confirm the student's exact location and condition",
      "Dispatch campus medical team / first-aider (simulated)",
      "Arrange ambulance transfer if condition worsens (simulated)",
      "Notify trusted contacts with an update",
      "Record treatment outcome and close the incident",
    ],
  },
  "physical-threat": {
    responseCategory: "Security Escalation",
    urgent:
      "Escalate immediately: dispatch the nearest security patrol to the shared location, keep the student in a safe, lit area and prepare to involve police (simulated).",
    standard:
      "Assign a security officer to contact the student, review CCTV for the area and increase patrols.",
    steps: [
      "Dispatch nearest security patrol to the location (simulated)",
      "Guide the student to the nearest safe point / staffed building",
      "Review CCTV footage of the area",
      "Escalate to law enforcement if required (simulated)",
      "Document statements and close with a safety follow-up",
    ],
  },
  harassment: {
    responseCategory: "Campus Security Review",
    urgent:
      "Send a security officer to the student now and separate the student from the harasser; open a priority case with the Proctor Office.",
    standard:
      "Open a confidential case for campus security review, contact the student within the hour and offer support services.",
    steps: [
      "Contact the student privately and confirm they are safe",
      "Collect details and any evidence (messages, descriptions)",
      "Review CCTV / witness information",
      "Refer to Proctor Office & counselling support",
      "Follow up with the student before closing",
    ],
  },
  accident: {
    responseCategory: "Medical & Transport Assistance",
    urgent:
      "Dispatch first-aid and security to the accident site, secure the area and arrange medical transfer (simulated).",
    standard:
      "Contact the student, confirm no one needs medical care and log details for the transport office.",
    steps: [
      "Secure the accident area",
      "Provide first aid / medical support (simulated)",
      "Arrange safe transport for the student",
      "Collect vehicle and witness details",
      "Inform transport office and close the report",
    ],
  },
  theft: {
    responseCategory: "Security Investigation",
    urgent:
      "Dispatch security to the location, check whether the suspect is still nearby and check the student is unharmed.",
    standard:
      "Log the stolen items, review CCTV and advise the student on blocking cards / devices.",
    steps: [
      "Record stolen item details",
      "Review CCTV for the time and place",
      "Advise the student to block SIM / bank cards",
      "Coordinate with lost & found",
      "Update the student and close",
    ],
  },
  "suspicious-activity": {
    responseCategory: "Security Patrol Check",
    urgent:
      "Send a patrol to verify the activity immediately and keep students away from the area until cleared.",
    standard: "Schedule a patrol check of the area and keep the report for pattern monitoring.",
    steps: [
      "Send patrol to inspect the reported area",
      "Verify identity of unknown persons if present",
      "Check unattended items safely",
      "Log observations for trend analysis",
    ],
  },
  fire: {
    responseCategory: "Fire Safety Response",
    urgent:
      "Activate the fire safety team, evacuate the affected building and alert the fire service (simulated). Do not use lifts.",
    standard:
      "Send the fire safety officer to inspect the reported hazard and isolate electrical supply if needed.",
    steps: [
      "Activate fire safety team (simulated)",
      "Evacuate the affected area / building",
      "Alert fire service if fire is confirmed (simulated)",
      "Account for all students at the assembly point",
      "Inspect and certify the area before re-entry",
    ],
  },
  other: {
    responseCategory: "General Security Review",
    urgent: "Send a security officer to the student's location to assess the situation in person.",
    standard: "Review the report and contact the student to understand what support is needed.",
    steps: [
      "Contact the student to clarify the situation",
      "Assign the right team based on the details",
      "Follow up and close the report",
    ],
  },
};

const ESCALATION_LEVEL: Record<Priority, string> = {
  CRITICAL: "Level 3 – Immediate escalation",
  HIGH: "Level 2 – Urgent response",
  MEDIUM: "Level 1 – Security review",
  LOW: "Level 0 – Monitor & log",
};

/* ---------------------------- helpers ---------------------------- */

function normalise(text: string) {
  return ` ${text.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ")} `;
}

function matchTerms(text: string, terms: string[]) {
  return terms.filter((t) => {
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(text);
  });
}

function priorityFromScore(score: number): Priority {
  if (score >= 75) return "CRITICAL";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

function maxPriority(a: Priority, b: Priority): Priority {
  return PRIORITIES[a].rank >= PRIORITIES[b].rank ? a : b;
}

/* ---------------------------- main entry point ---------------------------- */

export function classifyIncident(input: ClassifierInput): Classification {
  const slug = (CATEGORIES.find((c) => c.slug === input.categorySlug)?.slug ?? "other") as CategorySlug;
  const category = CATEGORIES.find((c) => c.slug === slug)!;
  const threat = (input.threatLevel ?? "NONE").toString();
  const injury = (input.injuryLevel ?? "NONE").toString();
  const danger = Boolean(input.immediateDanger);

  const text = normalise(
    [input.title, input.description, input.additionalNotes].filter(Boolean).join(". "),
  );

  const reasons: string[] = [];
  const signals: string[] = [];

  let score = CATEGORY_BASE[slug];
  reasons.push(`Category "${category.name}" starts at a base risk score of ${score}.`);

  const hits: Record<string, string[]> = {};
  for (const group of SIGNALS) {
    const found = matchTerms(text, group.terms);
    hits[group.key] = found;
    if (found.length) {
      // first match gives the full weight, extra matches add a little more (capped)
      const extra = Math.min(found.length - 1, 2) * Math.round(group.weight / 4);
      const delta = group.weight + (group.weight > 0 ? extra : 0);
      score += delta;
      signals.push(...found.map((f) => `${f} (${group.label})`));
      reasons.push(
        `Description contains ${group.label}${found.length > 1 ? "s" : ""}: "${found
          .slice(0, 3)
          .join('", "')}" (${delta > 0 ? "+" : ""}${delta}).`,
      );
    }
  }

  if (THREAT_WEIGHT[threat]) {
    score += THREAT_WEIGHT[threat];
    reasons.push(`Reported threat level is ${threat.toLowerCase()} (+${THREAT_WEIGHT[threat]}).`);
  }
  if (INJURY_WEIGHT[injury]) {
    score += INJURY_WEIGHT[injury];
    reasons.push(
      `Reported injury is ${injury.replace("_", "-").toLowerCase()} (+${INJURY_WEIGHT[injury]}).`,
    );
  }
  if (danger) {
    score += 20;
    reasons.push("Student indicated they are in immediate danger (+20).");
  }
  if (input.isSos) {
    score += 10;
    reasons.push("Report was raised through the SOS button (+10).");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  let priority = priorityFromScore(score);

  /* -------- explicit escalation rules (override the score where required) -------- */
  const lifeSignal = hits.life.length > 0;
  const dangerSignal = hits.danger.length > 0 || danger || threat === "SEVERE";
  const seriousInjury = injury === "SERIOUS" || injury === "LIFE_THREATENING";
  const anyThreat = dangerSignal || threat === "MODERATE";

  if (slug === "medical" && (seriousInjury || lifeSignal)) {
    priority = "CRITICAL";
    reasons.push("Rule: Medical Emergency + severe injury indicators ⇒ Critical.");
  }
  if (slug === "physical-threat" && dangerSignal) {
    priority = "CRITICAL";
    reasons.push("Rule: Physical Threat + active danger ⇒ Critical.");
  }
  if (slug === "fire" && (dangerSignal || hits.danger.length > 0)) {
    priority = "CRITICAL";
    reasons.push("Rule: Fire Emergency + spreading fire / danger ⇒ Critical.");
  }
  if (slug === "accident" && seriousInjury) {
    priority = maxPriority(priority, "CRITICAL");
    reasons.push("Rule: Accident with serious injury ⇒ Critical.");
  }
  if (lifeSignal && priority !== "CRITICAL") {
    priority = maxPriority(priority, "HIGH");
    reasons.push("Rule: any life-threatening indicator ⇒ at least High.");
  }
  if (slug === "harassment" && !anyThreat && !seriousInjury) {
    priority = "MEDIUM";
    reasons.push("Rule: Harassment with no immediate threat ⇒ Medium.");
  } else if (slug === "harassment" && dangerSignal) {
    priority = maxPriority(priority, "HIGH");
    reasons.push("Rule: Harassment with active danger ⇒ at least High.");
  }
  if (slug === "suspicious-activity" && !anyThreat && !lifeSignal && !seriousInjury) {
    priority = "LOW";
    reasons.push("Rule: Suspicious Activity with no direct threat ⇒ Low.");
  }
  if (input.isSos && priority === "LOW") {
    priority = "MEDIUM";
    reasons.push("Rule: SOS alerts are never classified below Medium.");
  }

  const play = PLAYBOOK[slug];
  const urgent = priority === "CRITICAL" || priority === "HIGH";

  return {
    priority,
    score,
    reasons,
    signals,
    recommendedAction: urgent ? play.urgent : play.standard,
    responseCategory: play.responseCategory,
    responseTeam: category.responseTeam,
    escalationLevel: ESCALATION_LEVEL[priority],
    targetResponse: PRIORITIES[priority].target,
    steps: play.steps,
  };
}

/** Safely parse the JSON reasons column. */
export function parseReasons(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [value];
  }
}

/** Steps for an incident category (used by the escalation center UI). */
export function playbookSteps(categorySlug: string): string[] {
  const slug = (CATEGORIES.find((c) => c.slug === categorySlug)?.slug ?? "other") as CategorySlug;
  return PLAYBOOK[slug].steps;
}
