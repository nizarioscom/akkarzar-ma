import { ExitCalculatorWidget } from "@/components/calculator/ExitCalculatorWidget";
import { Container } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale } from "@/lib/i18n/paths";

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return null;
  }

  return (
    <Container>
      <ExitCalculatorWidget locale={locale} copy={getDictionary(locale)} />
    </Container>
  );
}
