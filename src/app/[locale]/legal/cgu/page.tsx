import { Card, Container } from "@/components/ui";
import { isAppLocale } from "@/lib/i18n/paths";

export default async function CguPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }

  return (
    <Container>
      <Card>
        {locale === "ar" ? (
          <article className="grid gap-3 text-sm leading-7">
            <h1 className="text-2xl font-bold">شروط الاستخدام العامة — AkkarZar.ma</h1>
            <p>
              تقدّم المنصة خدمة وساطة معلوماتية لتسهيل التنازل عن عقود الحجز في إطار البيع في طور الإنجاز
              (القانون 107.12) دون زيادة على المبالغ المدفوعة فعلياً. ليست المنصة موثقاً ولا منعشاً عقارياً.
            </p>
            <p>
              لا ينتج أي أثر ناقل للملكية أو للحقوق العينية إلا بواسطة محرر رسمي وفق المادة 4 من مدونة الحقوق العينية،
              وبموافقة المنعش عندما يشترط القانون أو العقد ذلك.
            </p>
            <p>
              يلتزم البائع بتقديم معلومات صحيحة وعقد الحجز ووصولات الأداء. تحتفظ المنصة بحق تعليق أي إعلان مخالف
              أو احتيالي. العمولة: 0٪ على البائع و1.25٪ على المشتري، إضافة إلى رسوم التوثيق والتسجيل المستحقة للغير.
            </p>
            <p>يخضع استخدام المنصة للقانون المغربي وللاختصاص الترابي لمحاكم الدار البيضاء، ما لم ينص نص آمر بخلاف ذلك.</p>
          </article>
        ) : (
          <article className="grid gap-3 text-sm leading-7">
            <h1 className="text-2xl font-bold">Conditions générales d’utilisation — AkkarZar.ma</h1>
            <p>
              La plateforme fournit un service d’intermédiation informationnelle destiné à faciliter la cession de
              contrats de réservation conclus dans le cadre d’une vente en l’état futur d’achèvement (loi 107.12),
              au prix des sommes effectivement versées, sans plus-value. AkkarZar.ma n’est ni notaire ni promoteur.
            </p>
            <p>
              Aucun transfert de propriété ou de droit réel n’est opposable qu’en vertu d’un acte authentique, conformément
              à l’article 4 du Code des droits réels, et sous réserve de l’accord du promoteur lorsque la loi ou le contrat
              l’exigent.
            </p>
            <p>
              Le cédant garantit l’exactitude des informations et des pièces (contrat de réservation, quittances bancaires).
              La plateforme peut suspendre toute annonce frauduleuse. Commission : 0 % vendeur, 1,25 % acquéreur, hors
              émoluments notariés et droits d’enregistrement dus aux tiers.
            </p>
            <p>
              Les présentes CGU sont régies par le droit marocain. Les tribunaux de Casablanca sont compétents, sauf
              disposition d’ordre public contraire.
            </p>
          </article>
        )}
      </Card>
    </Container>
  );
}
