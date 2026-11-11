import type { Metadata } from "next";
import { KeyRound, UserCog } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/misc";
import { PasswordForm, ProfileForm } from "@/components/profile/profile-forms";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfilePage() {
  const user = await requireRole("STUDENT");
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile settings"
        description={`Member since ${formatDateTime(user.createdAt)}. Keep your phone number current so security can reach you.`}
      />
      <div className="space-y-6">
        <Card>
          <CardHeader title="Personal information" icon={<UserCog className="h-5 w-5" />} />
          <CardBody>
            <ProfileForm
              role="STUDENT"
              initial={{
                name: user.name,
                email: user.email,
                phone: user.phone ?? "",
                studentId: user.studentProfile?.studentId,
                department: user.studentProfile?.department ?? "",
                batch: user.studentProfile?.batch ?? "",
                shareLocationConsent: user.studentProfile?.shareLocationConsent ?? false,
              }}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Change password" description="Passwords are stored as secure bcrypt hashes." icon={<KeyRound className="h-5 w-5" />} />
          <CardBody>
            <PasswordForm />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
