"use client";

import * as React from "react";
import { FlaskConical } from "lucide-react";
import { Field, Select, Textarea, Toggle } from "@/components/ui/form";
import { ClassificationPanel } from "@/components/incidents/incident-parts";
import { classifyIncident } from "@/lib/classifier";
import { CATEGORIES, INJURY_LEVELS, THREAT_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  {
    id: "medical",
    label: "Scenario 1 · Medical",
    categorySlug: "medical",
    description: "A student collapsed on the stairs near the library and has a severe injury to her head, there is bleeding.",
    threatLevel: "NONE",
    injuryLevel: "SERIOUS",
    immediateDanger: false,
  },
  {
    id: "harassment",
    label: "Scenario 2 · Harassment",
    categorySlug: "harassment",
    description: "A man at the bus stand keeps making comments at me. No immediate threat, I have moved away from him.",
    threatLevel: "LOW",
    injuryLevel: "NONE",
    immediateDanger: false,
  },
  {
    id: "threat",
    label: "Scenario 3 · Physical threat",
    categorySlug: "physical-threat",
    description: "Two people are following me from the lakeside path and threatening me right now. I am alone and scared.",
    threatLevel: "SEVERE",
    injuryLevel: "NONE",
    immediateDanger: true,
  },
];

/** Lets administrators test the escalation workflow with the assignment scenarios. */
export function ScenarioSimulator() {
  const [active, setActive] = React.useState(SCENARIOS[0].id);
  const [categorySlug, setCategory] = React.useState(SCENARIOS[0].categorySlug);
  const [description, setDescription] = React.useState(SCENARIOS[0].description);
  const [threatLevel, setThreat] = React.useState(SCENARIOS[0].threatLevel);
  const [injuryLevel, setInjury] = React.useState(SCENARIOS[0].injuryLevel);
  const [immediateDanger, setDanger] = React.useState(SCENARIOS[0].immediateDanger);

  function load(id: string) {
    const s = SCENARIOS.find((x) => x.id === id)!;
    setActive(id);
    setCategory(s.categorySlug);
    setDescription(s.description);
    setThreat(s.threatLevel);
    setInjury(s.injuryLevel);
    setDanger(s.immediateDanger);
  }

  const result = classifyIncident({ categorySlug, description, threatLevel, injuryLevel, immediateDanger });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => load(s.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                active === s.id ? "bg-navy text-white ring-navy" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300",
              )}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => {
              setActive("custom");
              setDescription("");
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
              active === "custom" ? "bg-navy text-white ring-navy" : "bg-white text-slate-600 ring-slate-200",
            )}
          >
            Custom
          </button>
        </div>
        <Field label="Category" htmlFor="sim-cat">
          <Select id="sim-cat" value={categorySlug} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Student's description" htmlFor="sim-desc">
          <Textarea id="sim-desc" rows={4} value={description} onChange={(e) => { setActive("custom"); setDescription(e.target.value); }} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Threat level" htmlFor="sim-threat">
            <Select id="sim-threat" value={threatLevel} onChange={(e) => setThreat(e.target.value)}>
              {THREAT_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Injury" htmlFor="sim-injury">
            <Select id="sim-injury" value={injuryLevel} onChange={(e) => setInjury(e.target.value)}>
              {INJURY_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Toggle id="sim-danger" tone="sos" checked={immediateDanger} onChange={setDanger} label="Immediate danger reported" />
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <FlaskConical className="h-3.5 w-3.5" /> Test mode – nothing is saved and no incident is created.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">System output</p>
        <p className="mb-4 text-sm text-slate-600">
          Identified <strong className="text-navy">{CATEGORIES.find((c) => c.slug === categorySlug)?.name}</strong> →{" "}
          <strong className="text-navy">{result.responseCategory}</strong>
        </p>
        <ClassificationPanel
          audience="admin"
          priority={result.priority}
          score={result.score}
          reasons={result.reasons}
          recommendedAction={result.recommendedAction}
          responseCategory={result.responseCategory}
          responseTeam={result.responseTeam}
          escalationLevel={result.escalationLevel}
          steps={result.steps}
        />
      </div>
    </div>
  );
}
