import Image from "next/image";
import Link from "next/link";
import type { AppLocale, Dictionary } from "@/lib/i18n/dictionary";
import { formatMad } from "@/lib/i18n/format";
import { localePath } from "@/lib/i18n/paths";
import { FEATURED_DEMO } from "@/lib/listings/featured-demo";
import type { PublicListing } from "@/lib/listings/silent-exit";

export function FeaturedOpportunities({
  locale,
  copy,
  listings,
}: {
  locale: AppLocale;
  copy: Dictionary;
  listings: PublicListing[];
}) {
  const live = listings.slice(0, 3);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[var(--ink)]">{copy.featuredTitle}</h2>
        <Link
          href={localePath(locale, "/marketplace")}
          className="rounded-full border border-[#c4b8a4] bg-white px-4 py-2 text-sm font-semibold text-[#1a1712]"
        >
          {copy.viewListing}
        </Link>
      </div>
      {live.length === 0 ? <p className="mb-4 text-sm text-[#3f3a33]">{copy.emptyMarket}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {(live.length > 0
          ? live.map((listing) => ({
              id: listing.id,
              image: "/images/landing/listing-casa-apartment.png",
              city: listing.city,
              district: listing.district ?? "",
              title: listing.title,
              total: Number(listing.totalContractPrice),
              paid: Number(listing.amountPaid),
            }))
          : FEATURED_DEMO.map((item) => ({
              id: item.id,
              image: item.image,
              city: item.city[locale],
              district: item.district[locale],
              title: item.title[locale],
              total: item.totalContractPrice,
              paid: item.amountPaid,
            }))
        ).map((card) => (
          <article key={card.id} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
            <div className="relative h-44">
              <Image src={card.image} alt="" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-[#3f3a33]">
                {card.city}
                {card.district ? ` · ${card.district}` : ""}
              </p>
              <p className="mt-2 text-sm">
                {copy.oldPrice}: {formatMad(card.total, locale)}
              </p>
              <p className="text-sm">
                {copy.paid}: {formatMad(card.paid, locale)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
