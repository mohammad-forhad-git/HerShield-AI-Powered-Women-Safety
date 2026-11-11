import Link from "next/link";
import { ShieldQuestion } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-royal-50 text-royal">
        <ShieldQuestion className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-navy">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist, or you don&apos;t have permission to view it.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
        Back to HerShield
      </Link>
    </div>
  );
}
