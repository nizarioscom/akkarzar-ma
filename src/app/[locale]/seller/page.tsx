import { SellerWizard } from "@/components/seller-wizard";
import { Card, Container } from "@/components/ui";
import { getSessionProfile } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale } from "@/lib/i18n/paths";
import { sellerListings } from "@/lib/listings/dashboard";

export default async function SellerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }
  const copy = getDictionary(locale);
  const profile = await getSessionProfile();
  const listings = profile ? await sellerListings(profile.id) : [];

  return (
    <Container>
      <h1 className="mb-4 text-3xl font-bold">{copy.navSeller}</h1>
      <SellerWizard copy={copy} />
      <div className="mt-6 grid gap-3">
        <h2 className="text-xl font-semibold">{copy.tracker}</h2>
        {listings.map((listing) => (
          <Card key={listing.id}>
            <p className="font-semibold">{listing.title}</p>
            <p className="text-sm">
              {listing.city} · {listing.status} · {copy.silent}: {listing.silentExit ? "ON" : "OFF"}
            </p>
          </Card>
        ))}
      </div>
    </Container>
  );
}
