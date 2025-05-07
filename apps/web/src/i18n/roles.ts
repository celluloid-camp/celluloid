import { useTranslations } from "next-intl";

export function useLocaleRole() {
  const t = useTranslations("profile.role");

  function getLocaleLabel(
    role: string | "admin" | "teacher" | "student" | null,
  ) {
    if (!role) return t("student");
    return t(role as "admin" | "teacher" | "student");
  }
  return getLocaleLabel;
}
