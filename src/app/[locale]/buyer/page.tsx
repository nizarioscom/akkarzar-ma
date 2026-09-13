import { MarketplaceClient } from "@/app/marketplace/marketplace-client";
import { Card, Container } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale } from "@/lib/i18n/paths";
import { safePublicListings } from "@/lib/listings/dashboard";

export default async function BuyerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }
  const copy = getDictionary(locale);
  const listings = await safePublicListings();

  return (
    <Container>
      <h1 className="mb-2 text-3xl font-bold">{copy.buyerTitle}</h1>
      <Card>
        <p className="text-sm text-[var(--muted)]">{copy.holdNote}</p>
      </Card>
      <div className="mt-4">
        <MarketplaceClient copy={copy} listings={listings} />
      </div>
    </Container>
  );
}
