import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "Backstage",
    template: "%s | Backstage",
  },
  description: "Architectural furniture — transparent build and pricing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeHeader = (await headers()).get("X-NEXT-INTL-LOCALE");
  const locale =
    localeHeader &&
    routing.locales.includes(localeHeader as (typeof routing.locales)[number])
      ? localeHeader
      : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${dmSerif.variable} ${manrope.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-[var(--color-brand-canvas)] text-[var(--color-brand-ink)] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
