import Link from "next/link";
import { Card, Container } from "@/components/ui";
import { getSessionProfile } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale, localePath } from "@/lib/i18n/paths";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }
  const copy = getDictionary(locale);
  const profile = await getSessionProfile();

  return (
    <Container>
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
      <Card>
        <p>{profile ? `${profile.role} · ${profile.id}` : copy.loginNeeded}</p>
        <div className="mt-3 flex gap-3 text-sm">
          <Link href={localePath(locale, "/seller")}>{copy.navSeller}</Link>
          <Link href={localePath(locale, "/buyer")}>{copy.navBuyer}</Link>
        </div>
      </Card>
    </Container>
  );
}
