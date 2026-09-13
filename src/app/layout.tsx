import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import { readLocale } from "@/lib/i18n/locale";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AkkarZar.ma — عقار زار · تنازل VEFA بسعر التكلفة",
    template: "%s · AkkarZar.ma",
  },
  description:
    "منصة مغربية للتنازل عن عقود الحجز VEFA (القانون 107.12) بسعر التكلفة تحت رقابة الموثق (المادة 4).",
  keywords: [
    "VEFA Maroc",
    "تنازل عقد حجز",
    "القانون 107.12",
    "موثق",
    "عقار المغرب",
    "AkkarZar",
    "عقار زار",
    "cession contrat réservation",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await readLocale();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={cairo.variable}>
      <body>{children}</body>
    </html>
  );
}
