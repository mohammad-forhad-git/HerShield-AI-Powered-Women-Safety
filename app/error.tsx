"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-sos">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-navy">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {error.message || "An unexpected error occurred."} If this keeps happening, make sure the database is set up
        with <code className="rounded bg-slate-100 px-1">npm run setup</code>.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
