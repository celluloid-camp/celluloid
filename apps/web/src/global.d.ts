import type { locales } from "@/i18n/config";
import type { formats } from "@/i18n/request";
import type messages from "../locales/en.json";


declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
    Formats: typeof formats
  }
}


