import type { AppLocale } from "@/lib/i18n/dictionary";

export type PlaybookEntry = {
  id: string;
  label: { ar: string; fr: string };
  keywords: string[];
  answer: { ar: string; fr: string };
};

export const AI_PLAYBOOK: PlaybookEntry[] = [
  {
    id: "sell",
    label: { ar: "عندي وحدة وأريد بيعها", fr: "J’ai un lot à céder" },
    keywords: ["بيع", "تنازل", "عندي وحدة", "عندي شقة", "ceder", "céder", "vendre", "lot à"],
    answer: {
      ar: "إذا كان لديك عقد حجز VEFA وتريد التنازل: ادخل فضاء البائع، ارفع العقد ووصولات الأداء، فعّل التخارج الصامت إن رغبت، ثم نُرسل الملف للمنعش ثم الموثق. تسترجع 100٪ مما دُفع و0 درهم عمولة على البائع.",
      fr: "Pour céder un contrat VEFA : ouvrez l’espace vendeur, déposez le contrat et les quittances, activez la sortie silencieuse si besoin. Le dossier part au promoteur puis au notaire. Vous récupérez 100 % du versé, 0 DH de commission vendeur.",
    },
  },
  {
    id: "buy",
    label: { ar: "أبحث عن فرصة", fr: "Je cherche une opportunité" },
    keywords: ["فرصة", "أبحث", "كنقلب", "acheter", "opportunité", "cherche"],
    answer: {
      ar: "الفرص تظهر في السوق بسعر العقد الأصلي (0٪ زيادة). اختر إعلاناً، احجز 24 ساعة، ثم يُستكمل التنازل لدى الموثق. عمولة المشتري 1.25٪ عند التسوية فقط.",
      fr: "Les opportunités sont au prix du contrat d’origine (0 % de surprix). Réservez 24 h puis finalisez chez le notaire. Commission acheteur : 1,25 % au règlement uniquement.",
    },
  },
  {
    id: "what",
    label: { ar: "ما فكرة المنصة؟", fr: "C’est quoi AkkarZar ?" },
    keywords: ["فكرة", "شنو", "ما هي المنصة", "c’est quoi", "c'est quoi", "akkarzar", "plateforme"],
    answer: {
      ar: "عقار زار (AkkarZar.ma) منصة مغربية لنقل عقد حجز VEFA بسعر ما دُفع فعلاً، وفق القانون 107.12، مع تحقق الموثق (المادة 4) وسرية البائع (CNDP 09.08). لسنا موثقاً ولا منعشاً.",
      fr: "AkkarZar.ma transfère un contrat VEFA au montant déjà versé, loi 107.12, contrôle notarial (article 4) et confidentialité CNDP 09.08. Nous ne remplaçons ni le notaire ni le promoteur.",
    },
  },
  {
    id: "noreply",
    label: { ar: "سألت عن وحدة ولم يصلني رد", fr: "Pas de réponse sur un lot" },
    keywords: ["لم يصل", "ما جاوب", "بدون رد", "sans réponse", "pas de réponse", "aucune réponse"],
    answer: {
      ar: "إذا حجزت وحدة ولم يصلك رد خلال 24 ساعة، أعد فتح الإعلان من السوق أو راسل فضاء المشتري. الحجز خيار مؤقت؛ التأكيد النهائي يتم بعد موافقة المنعش وتوثيق الموثق.",
      fr: "Si une option 24 h reste sans suite, rouvrez l’annonce ou l’espace acheteur. L’option est temporaire ; la cession se confirme après promoteur et notaire.",
    },
  },
  {
    id: "app",
    label: { ar: "التطبيق وكيف أبدأ", fr: "L’application, par où commencer" },
    keywords: ["تطبيق", "أبدأ", "كيفاش", "application", "commencer", "start"],
    answer: {
      ar: "ابدأ من الصفحة الرئيسية: قدّر التخارج بالحاسبة، أو استعرض الفرص، أو أنشئ مسودة في فضاء البائع. المساعد يعمل محلياً حتى دون اتصال بخادم ذكاء خارجي.",
      fr: "Depuis l’accueil : estimez une sortie, parcourez le marché, ou créez un brouillon vendeur. Ce conseiller fonctionne hors ligne, sans serveur d’IA externe.",
    },
  },
];

function normalize(text: string): string {
  return text.toLocaleLowerCase("fr").normalize("NFKC");
}

export function matchPlaybook(prompt: string, locale: AppLocale): PlaybookEntry | null {
  const haystack = normalize(prompt);
  return (
    AI_PLAYBOOK.find((entry) => {
      if (normalize(entry.label[locale]) === haystack) {
        return true;
      }
      return entry.keywords.some((key) => haystack.includes(normalize(key)));
    }) ?? null
  );
}

export function playbookAnswer(entry: PlaybookEntry, locale: AppLocale): string {
  return entry.answer[locale];
}
