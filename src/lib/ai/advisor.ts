import { calculateExitFinancials, type ExitFinancials } from "@/lib/calculators/exitCalculator";
import { formatMad } from "@/lib/i18n/format";
import type { AppLocale } from "@/lib/i18n/dictionary";
import { matchPlaybook, playbookAnswer } from "@/lib/ai/playbook";

export type AdvisorReply = {
  text: string;
  financials?: ExitFinancials;
};

function extractAmounts(prompt: string): number[] {
  const matches = prompt.match(/\d[\d.\s]{2,}/g) ?? [];
  return matches
    .map((token) => Number(token.replace(/[^\d.]/g, "")))
    .filter((value) => Number.isFinite(value) && value >= 1000)
    .slice(0, 2);
}

function mentions(prompt: string, keys: string[]): boolean {
  const normalized = prompt.toLocaleLowerCase("fr");
  return keys.some((key) => normalized.includes(key));
}

export function adviseAkkarZar(prompt: string, locale: AppLocale): AdvisorReply {
  const amounts = extractAmounts(prompt);
  if (amounts.length >= 2) {
    const [first, second] = amounts;
    const total = Math.max(first, second);
    const paid = Math.min(first, second);
    try {
      const financials = calculateExitFinancials({
        totalContractPrice: total,
        amountPaid: paid,
      });
      const text =
        locale === "ar"
          ? `تقدير عقار زار: استرداد البائع ${formatMad(financials.sellerNetRefund, "ar")} (0 درهم عمولة). خسارة الإلغاء لدى المنعش نحو ${formatMad(financials.cancellationPenaltyAmount, "ar")}. عمولة المشتري 1.25٪ = ${formatMad(financials.buyerPlatformFee, "ar")} عند التسوية لدى الموثق.`
          : `Estimation AkkarZar : remboursement vendeur ${formatMad(financials.sellerNetRefund, "fr")} (0 DH de commission). Pénalité d’annulation promoteur ≈ ${formatMad(financials.cancellationPenaltyAmount, "fr")}. Frais acheteur 1,25 % = ${formatMad(financials.buyerPlatformFee, "fr")} au règlement notarial.`;
      return { text, financials };
    } catch (error) {
      return {
        text: error instanceof Error ? error.message : "calculation_failed",
      };
    }
  }

  const scripted = matchPlaybook(prompt, locale);
  if (scripted) {
    return { text: playbookAnswer(scripted, locale) };
  }

  if (mentions(prompt, ["موثق", "notaire", "article 4", "المادة 4", "acte"])) {
    return {
      text:
        locale === "ar"
          ? "المادة 4 من مدونة الحقوق العينية: نقل الحقوق العينية لا يكون حجة إلا بمحرر رسمي. الموثق يتحقق من عقد الحجز ويُعد التنازل. المنصة تُحضّر الملف ولا تحل محل الموثق."
          : "Article 4 du Code des droits réels : le transfert de droits réels n’est opposable que par acte authentique. Le notaire vérifie le contrat de réservation et formalise la cession. AkkarZar prépare le dossier et ne remplace pas le notaire.",
    };
  }

  if (mentions(prompt, ["107.12", "vefa", "فيفا", "بيع في طور"])) {
    return {
      text:
        locale === "ar"
          ? "القانون 107.12 ينظم البيع في طور الإنجاز. التنازل عن عقد الحجز يتطلّب عادة موافقة المنعش ثم تحقق الموثق. عقار زار ينقل العقد بسعر ما دُفع فعلاً، دون زيادة."
          : "La loi 107.12 encadre la VEFA. La cession du contrat de réservation exige en pratique l’accord du promoteur puis le contrôle notarial. AkkarZar transfère le contrat au montant déjà versé, sans surprix.",
    };
  }

  if (mentions(prompt, ["صامت", "silent", "هوية", "confidential"])) {
    return {
      text:
        locale === "ar"
          ? "التخارج الصامت يخفي هوية البائع عن العموم. لا تُكشف إلا للموثق أو بعد مرحلة التوثيق للأطراف المعنية، امتثالاً لـ CNDP 09.08."
          : "La sortie silencieuse masque l’identité du vendeur au public. Elle n’est révélée qu’au notaire ou après l’étape notariale aux parties concernées, conformément à la CNDP 09.08.",
    };
  }

  return {
    text:
      locale === "ar"
        ? "اكتب سعر العقد والمبلغ المدفوع بالدرهم لأحسب التخارج، أو اسأل عن القانون 107.12 أو خطوات الموثق."
        : "Indiquez le prix du contrat et le montant versé en MAD pour une estimation, ou posez une question sur la loi 107.12 / les étapes notariales.",
  };
}
