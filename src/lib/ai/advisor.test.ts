import { describe, expect, it } from "vitest";
import { adviseAkkarZar } from "@/lib/ai/advisor";

describe("adviseAkkarZar", () => {
  it("returns a bilingual financial breakdown from two MAD amounts", () => {
    const ar = adviseAkkarZar("سعر العقد 1200000 والمبلغ المدفوع 350000", "ar");
    const fr = adviseAkkarZar("1 200 000 et 350 000 déjà versés", "fr");

    expect(ar.financials?.sellerNetRefund).toBe(350_000);
    expect(ar.financials?.buyerPlatformFee).toBe(15_000);
    expect(ar.text).toMatch(/عقار زار/);
    expect(fr.financials?.sellerNetRefund).toBe(350_000);
    expect(fr.text).toMatch(/AkkarZar/);
  });

  it("answers programmed playbook questions offline", () => {
    expect(adviseAkkarZar("ما فكرة المنصة؟", "ar").text).toMatch(/عقار زار/);
    expect(adviseAkkarZar("C’est quoi AkkarZar ?", "fr").text).toMatch(/AkkarZar\.ma/);
    expect(adviseAkkarZar("عندي وحدة وأريد بيعها", "ar").text).toMatch(/فضاء البائع/);
  });

  it("answers VEFA 107.12 and notary Article 4 questions in AR and FR", () => {
    expect(adviseAkkarZar("ما هو القانون 107.12؟", "ar").text).toMatch(/107\.12/);
    expect(adviseAkkarZar("loi VEFA 107.12", "fr").text).toMatch(/107\.12/);
    expect(adviseAkkarZar("خطوات الموثق والمادة 4", "ar").text).toMatch(/المادة 4/);
    expect(adviseAkkarZar("article 4 notaire", "fr").text).toMatch(/Article 4/);
  });
});
