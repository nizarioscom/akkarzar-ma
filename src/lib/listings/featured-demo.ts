import type { AppLocale } from "@/lib/i18n/dictionary";

export type FeaturedOpportunity = {
  id: string;
  image: string;
  city: Record<AppLocale, string>;
  district: Record<AppLocale, string>;
  title: Record<AppLocale, string>;
  totalContractPrice: number;
  amountPaid: number;
};

export const FEATURED_DEMO: FeaturedOpportunity[] = [
  {
    id: "demo-casa-anfa",
    image: "/images/landing/listing-casa-apartment.png",
    city: { ar: "الدار البيضاء", fr: "Casablanca" },
    district: { ar: "أنفا", fr: "Anfa" },
    title: { ar: "شقة قيد الإنجاز — أنفا", fr: "Appartement VEFA — Anfa" },
    totalContractPrice: 1_450_000,
    amountPaid: 420_000,
  },
  {
    id: "demo-rabat-riad",
    image: "/images/landing/listing-rabat-residence.png",
    city: { ar: "الرباط", fr: "Rabat" },
    district: { ar: "حي الرياض", fr: "Hay Riad" },
    title: { ar: "إقامة سكنية — حي الرياض", fr: "Résidence — Hay Riad" },
    totalContractPrice: 1_180_000,
    amountPaid: 310_000,
  },
  {
    id: "demo-tanger-keys",
    image: "/images/landing/service-buyer-keys.png",
    city: { ar: "طنجة", fr: "Tanger" },
    district: { ar: "مالاباطا", fr: "Malabata" },
    title: { ar: "ملف حجز موثّق — مالاباطا", fr: "Dossier de réservation — Malabata" },
    totalContractPrice: 980_000,
    amountPaid: 245_000,
  },
];
