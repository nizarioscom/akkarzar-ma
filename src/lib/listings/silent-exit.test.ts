import { describe, expect, it } from "vitest";
import { canRevealSellerIdentity } from "@/lib/listings/silent-exit";

const listing = {
  sellerId: "seller-1",
  silentExit: true,
  status: "LIVE" as const,
  developerCompanyId: "dev-1",
  assignedNotaryOfficeId: "notary-1",
  reservedByBuyerId: "buyer-1",
};

describe("silent exit", () => {
  it("hides seller identity from public and live buyers", () => {
    expect(canRevealSellerIdentity(listing, null)).toBe(false);
    expect(
      canRevealSellerIdentity(listing, {
        id: "buyer-1",
        role: "BUYER",
        developerCompanyId: null,
        notaryOfficeId: null,
      }),
    ).toBe(false);
  });

  it("reveals seller to the assigned notary and after notary stage", () => {
    expect(
      canRevealSellerIdentity(listing, {
        id: "n1",
        role: "NOTARY_PARTNER",
        developerCompanyId: null,
        notaryOfficeId: "notary-1",
      }),
    ).toBe(true);

    expect(
      canRevealSellerIdentity(
        { ...listing, status: "NOTARY_REVIEW" },
        {
          id: "buyer-1",
          role: "BUYER",
          developerCompanyId: null,
          notaryOfficeId: null,
        },
      ),
    ).toBe(true);
  });
});
