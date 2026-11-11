"use client";

import { Check } from "lucide-react";
import { CategoryIcon } from "./badges";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryPicker({
  value,
  onChange,
  error,
  compact = false,
}: {
  value: string;
  onChange: (slug: string) => void;
  error?: string;
  compact?: boolean;
}) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Emergency category"
        className={cn("grid gap-2.5", compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 lg:grid-cols-4")}
      >
        {CATEGORIES.map((c) => {
          const selected = value === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(c.slug)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-xl border bg-white p-3 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-royal/20",
                selected ? "border-transparent shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
              )}
              style={selected ? { boxShadow: `0 0 0 2px ${c.color}`, backgroundColor: `${c.color}0D` } : undefined}
            >
              {selected && (
                <span
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: c.color }}
                >
                  <Check className="h-3 w-3" />
                </span>
              )}
              <CategoryIcon slug={c.slug} size={compact ? "md" : "lg"} />
              <span>
                <span className="block text-sm font-semibold text-navy">{c.name}</span>
                {!compact && <span className="mt-0.5 block text-xs leading-snug text-slate-500">{c.description}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
