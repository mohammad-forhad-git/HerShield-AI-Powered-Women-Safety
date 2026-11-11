import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-slate-400" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
