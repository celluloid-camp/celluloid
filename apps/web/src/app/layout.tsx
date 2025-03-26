import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

const abril_fatfaceregular = localFont({
  src: [
    {
      path: "../../public/fonts/abrilfatface-regular-webfont.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

const lexend = localFont({
  src: [
    {
      path: "../../public/fonts/lexend-variablefont_wght-webfont.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Celluloid",
  description: "Video annotation platform for education",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${lexend.className} ${abril_fatfaceregular.className}`}
    >
      <body>
        <NextIntlClientProvider>
          <AppRouterCacheProvider options={{ key: "css" }}>
            <AppProviders>{children}</AppProviders>
          </AppRouterCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
