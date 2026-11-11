/* Quick verification of the classification engine against the assignment scenarios.
 * Run: npm run test:classifier */
import { classifyIncident } from "../lib/classifier";

const cases = [
  {
    name: "Medical Emergency + severe injury",
    expect: "CRITICAL",
    input: { categorySlug: "medical", description: "My friend fell on the stairs and has a severe injury, heavy bleeding from the head.", injuryLevel: "SERIOUS" },
  },
  {
    name: "Physical Threat + active danger",
    expect: "CRITICAL",
    input: { categorySlug: "physical-threat", description: "A man is following me near the bus stand and threatening me right now.", immediateDanger: true },
  },
  {
    name: "Harassment + no immediate threat",
    expect: "MEDIUM",
    input: { categorySlug: "harassment", description: "A senior keeps sending me unwanted messages. No immediate threat, I am safe now." },
  },
  {
    name: "Suspicious Activity + no direct threat",
    expect: "LOW",
    input: { categorySlug: "suspicious-activity", description: "Noticed an unknown person taking photos near the library gate." },
  },
  {
    name: "Fire spreading",
    expect: "CRITICAL",
    input: { categorySlug: "fire", description: "Flames coming from the cafeteria kitchen, fire spreading fast." },
  },
  {
    name: "Theft, lost phone yesterday",
    expect: "LOW",
    input: { categorySlug: "theft", description: "My phone was stolen yesterday from the reading room, no one was hurt." },
  },
  {
    name: "SOS suspicious activity floor",
    expect: "MEDIUM",
    input: { categorySlug: "suspicious-activity", description: "SOS", isSos: true },
  },
] as const;

let failed = 0;
for (const c of cases) {
  const r = classifyIncident(c.input as never);
  const ok = r.priority === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.name} -> ${r.priority} (score ${r.score}), expected ${c.expect}`);
  if (!ok) console.log("      reasons:", r.reasons.join(" | "));
}
console.log(failed ? `\n${failed} case(s) failed` : "\nAll classifier scenarios passed.");
process.exit(failed ? 1 : 0);
