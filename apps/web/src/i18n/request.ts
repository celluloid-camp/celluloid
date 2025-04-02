import { getUserLocale } from "@/services/locale";
import type { Formats } from "next-intl";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = (await getUserLocale()) as "en" | "fr";

  try {
    const messages = (await import(`../../locales/${locale}.json`)).default;
    return { locale, messages };
  } catch (error) {
    // Fallback to default locale (assuming 'en' is your default)
    console.warn(`Failed to load locale ${locale}, falling back to en`);
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    const defaultMessages = (await import(`../../locales/en.json`)).default;
    return { locale: "en" as const, messages: defaultMessages };
  }
});

export const formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 5,
    },
  },
  list: {
    enumeration: {
      style: "long",
      type: "conjunction",
    },
  },
} satisfies Formats;
