import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Student Login" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your HerShield student account."
      footer={
        <>
          New to HerShield? <Link href="/register" className="font-semibold text-royal">Create an account</Link>
          <span className="mx-2">·</span>
          <Link href="/admin/login" className="font-semibold text-slate-700">Security login</Link>
        </>
      }
    >
      <LoginForm portal="student" next={searchParams.next} demo={{ email: "ayesha.rahman@diu.edu.bd", password: "Student@123" }} />
    </AuthShell>
  );
}
