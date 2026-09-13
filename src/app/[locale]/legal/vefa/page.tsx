import { Card, Container } from "@/components/ui";
import { isAppLocale } from "@/lib/i18n/paths";

export default async function VefaGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }

  return (
    <Container>
      <Card>
        {locale === "ar" ? (
          <article className="grid gap-3 text-sm leading-7 text-[#1a1712]">
            <h1 className="text-2xl font-bold">دليل القانون 107.12 (VEFA)</h1>
            <p>
              ينظم القانون 107.12 البيع في طور الإنجاز. عقد الحجز يحدد الثمن والأقساط والوحدة. التنازل عنه لمشترٍ جديد
              يستوجب عادة موافقة المنعش ثم محرراً رسمياً لدى الموثق.
            </p>
            <p>
              عقار زار (AkkarZar.ma) يسهّل نقل العقد بسعر ما دُفع فعلاً، دون زيادة، مع إخفاء هوية البائع عند تفعيل التخارج
              الصامت. التقديرات المالية استرشادية؛ الرسوم النهائية يحددها الموثق.
            </p>
          </article>
        ) : (
          <article className="grid gap-3 text-sm leading-7 text-[#1a1712]">
            <h1 className="text-2xl font-bold">Repères — loi 107.12 (VEFA)</h1>
            <p>
              La loi 107.12 encadre la vente en l’état futur d’achèvement. Le contrat de réservation fixe le prix, les
              échéances et le lot. Sa cession à un nouvel acquéreur requiert en pratique l’accord du promoteur puis un
              acte authentique.
            </p>
            <p>
              AkkarZar.ma facilite le transfert au montant déjà versé, sans surprix, et masque l’identité du cédant si la
              sortie silencieuse est activée. Les calculs sont indicatifs ; le notaire fixe les frais définitifs.
            </p>
          </article>
        )}
      </Card>
    </Container>
  );
}
