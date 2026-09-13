"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { PublicListing } from "@/lib/listings/silent-exit";
import { Button, Card } from "@/components/ui";

export function MarketplaceClient({
  copy,
  listings,
}: {
  copy: Dictionary;
  listings: PublicListing[];
}) {
  const [city, setCity] = useState("all");
  const cities = useMemo(() => Array.from(new Set(listings.map((item) => item.city))), [listings]);
  const filtered = listings.filter((item) => city === "all" || item.city === city);

  async function reserve(id: string) {
    await fetch(`/api/listings/${id}/reserve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ holdHours: 24 }),
    });
  }

  return (
    <div className="grid gap-4">
      <label className="text-sm">
        {copy.filterCity}
        <select className="ms-2 rounded-xl border border-[var(--line)] px-2 py-1" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">{copy.allCities}</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((listing) => (
          <Card key={listing.id}>
            <h2 className="text-lg font-semibold">{listing.title}</h2>
            <p className="text-sm text-[var(--muted)]">
              {listing.city}
              {listing.district ? ` · ${listing.district}` : ""}
            </p>
            <p className="mt-2">
              {copy.oldPrice}: {listing.totalContractPrice} {listing.currency}
            </p>
            <p>
              {copy.paid}: {listing.amountPaid} {listing.currency}
            </p>
            {listing.silentExit ? <p className="text-xs">{copy.silent}</p> : null}
            {listing.seller ? <p className="text-xs">{listing.seller.displayName}</p> : null}
            <Button className="mt-3" type="button" onClick={() => void reserve(listing.id)}>
              {copy.reserve}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
