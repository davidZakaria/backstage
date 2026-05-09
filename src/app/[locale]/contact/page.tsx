import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-4xl">{t("title")}</h1>
      <ContactForm />
    </div>
  );
}
