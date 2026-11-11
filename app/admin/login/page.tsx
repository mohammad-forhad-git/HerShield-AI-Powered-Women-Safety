import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <AuthShell
      variant="admin"
      title="Security console"
      subtitle="Authorised campus security and administrators only."
      footer={
        <>
          Are you a student? <Link href="/login" className="font-semibold text-royal">Student login</Link>
        </>
      }
    >
      <LoginForm portal="admin" next={searchParams.next} demo={{ email: "security@diu.edu.bd", password: "Admin@123" }} />
    </AuthShell>
  );
}
