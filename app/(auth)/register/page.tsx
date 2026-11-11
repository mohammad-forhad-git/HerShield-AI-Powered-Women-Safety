import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Student Registration" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your student account"
      subtitle="Register with your DIU student details to access emergency features."
      footer={
        <>
          Already registered? <Link href="/login" className="font-semibold text-royal">Sign in</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
