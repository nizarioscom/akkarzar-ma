import { MarketplaceClient } from "@/app/marketplace/marketplace-client";
import { Container } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale } from "@/lib/i18n/paths";
import { safePublicListings } from "@/lib/listings/dashboard";

export default async function MarketplacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }
  const copy = getDictionary(locale);
  const listings = await safePublicListings();

  return (
    <Container>
      <h1 className="mb-4 text-3xl font-bold">{copy.navMarket}</h1>
      <MarketplaceClient copy={copy} listings={listings} />
    </Container>
  );
}
