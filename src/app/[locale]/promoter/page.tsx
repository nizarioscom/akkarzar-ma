import { ReviewQueue } from "@/components/review-queue";
import { Container } from "@/components/ui";
import { getSessionUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale } from "@/lib/i18n/paths";
import { promoterQueue } from "@/lib/listings/dashboard";

export default async function PromoterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }
  const copy = getDictionary(locale);
  const user = await getSessionUser();
  const items = await promoterQueue(user?.developerCompanyId ?? null);

  return (
    <Container>
      <h1 className="mb-4 text-3xl font-bold">{copy.promoterTitle}</h1>
      <ReviewQueue copy={copy} items={items} endpoint="/api/reviews/promoter" />
    </Container>
  );
}
