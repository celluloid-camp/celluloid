import { Trans } from "react-i18next";

export const TransUserRole = ({ role }: { role?: string }) =>
  role === "admin" ? (
    <Trans i18nKey="profile.role.admin" />
  ) : role === "teacher" ? (
    <Trans i18nKey="profile.role.teacher" />
  ) : (
    <Trans i18nKey="profile.role.student" />
  );
