import { Card, Container } from "@/components/ui";
import { isAppLocale } from "@/lib/i18n/paths";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }

  return (
    <Container>
      <Card>
        {locale === "ar" ? (
          <article className="grid gap-3 text-sm leading-7">
            <h1 className="text-2xl font-bold">سياسة الخصوصية — القانون 09.08 (CNDP)</h1>
            <p>
              المسؤول عن المعالجة: مشغّل AkkarZar.ma. الغاية: إنشاء حسابات، معالجة طلبات التنازل، التحقق من الوثائق،
              والتواصل التشغيلي (بما فيه واتساب عند تقديم الرقم).
            </p>
            <p>
              تُشفَّر معطيات الهوية والعقود (AES-256-GCM). لا تُعرض هوية البائع علناً عند تفعيل التخارج الصامت، إلا للموثق
              أو بعد مرحلة التوثيق للأطراف المعنية. تُسجَّل محاولات فك تشفير المعطيات الحساسة في سجل تدقيق غير قابل للتعديل
              من الواجهة.
            </p>
            <p>
              المدة: تُحفظ المعطيات طيلة معالجة الملف ثم للمدة اللازمة للالتزامات القانونية. للمستعمل حق الولوج والتصحيح
              والتعرض وفق القانون 09.08 عبر طلب موجّه إلى المشغّل. لا يُنقل أي ملف إلى الخارج دون أساس قانوني مناسب.
            </p>
          </article>
        ) : (
          <article className="grid gap-3 text-sm leading-7">
            <h1 className="text-2xl font-bold">Politique de confidentialité — loi 09.08 (CNDP)</h1>
            <p>
              Responsable de traitement : l’exploitant d’AkkarZar.ma. Finalités : comptes, instruction des cessions,
              vérification documentaire et communications opérationnelles (y compris WhatsApp si un numéro est fourni).
            </p>
            <p>
              Les données d’identité et les contenus contractuels sont chiffrés (AES-256-GCM). L’identité du vendeur n’est
              pas exposée publiquement lorsque la sortie silencieuse est activée, sauf au notaire ou aux parties après
              l’étape notariale. Toute tentative de déchiffrement de données sensibles est consignée dans un journal
              d’audit non modifiable depuis l’interface.
            </p>
            <p>
              Durée : conservation le temps du dossier puis pour les obligations légales. Droits d’accès, de rectification
              et d’opposition conformément à la loi 09.08, exercés auprès de l’exploitant. Aucun transfert hors du Maroc
              sans base légale appropriée.
            </p>
          </article>
        )}
      </Card>
    </Container>
  );
}
