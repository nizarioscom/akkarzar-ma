import { describe, expect, it } from "vitest";
import {
  assertCessionTransition,
  canTransition,
  hasRequiredSellerDocuments,
} from "@/lib/workflow/cession";

describe("cession state machine", () => {
  it("follows the happy path", () => {
    expect(canTransition("DRAFT", "PENDING_DOCS_VERIFICATION")).toBe(true);
    expect(canTransition("PENDING_DOCS_VERIFICATION", "PROMOTER_APPROVAL_PENDING")).toBe(true);
    expect(canTransition("PROMOTER_APPROVAL_PENDING", "NOTARY_REVIEW")).toBe(true);
    expect(canTransition("NOTARY_REVIEW", "LIVE")).toBe(true);
    expect(canTransition("LIVE", "RESERVED")).toBe(true);
    expect(canTransition("RESERVED", "COMPLETED")).toBe(true);
  });

  it("blocks illegal jumps", () => {
    expect(canTransition("DRAFT", "LIVE")).toBe(false);
    expect(() =>
      assertCessionTransition({ from: "DRAFT", to: "LIVE", role: "ADMIN" }),
    ).toThrow(/illegal_transition/);
  });

  it("restricts promoter and buyer roles", () => {
    expect(() =>
      assertCessionTransition({
        from: "PROMOTER_APPROVAL_PENDING",
        to: "NOTARY_REVIEW",
        role: "BUYER",
      }),
    ).toThrow(/forbidden_transition_for_role/);

    expect(() =>
      assertCessionTransition({
        from: "PROMOTER_APPROVAL_PENDING",
        to: "NOTARY_REVIEW",
        role: "DEVELOPER_PROMOTER",
      }),
    ).not.toThrow();
  });

  it("requires both reservation contract and bank receipt", () => {
    expect(hasRequiredSellerDocuments(["CONTRACT_RESERVATION"])).toBe(false);
    expect(hasRequiredSellerDocuments(["CONTRACT_RESERVATION", "BANK_PAYMENT_RECEIPT"])).toBe(true);
  });
});
