import { Trans } from "react-i18next";

export const TransUserRole = ({
  role,
}: {
  role: "Student" | "Teacher" | "Admin";
}) =>
  role == "Student" ? (
    <Trans i18nKey="profile.role.student" />
  ) : role == "Teacher" ? (
    <Trans i18nKey="profile.role.teacher" />
  ) : (
    <Trans i18nKey="profile.role.admin" />
  );
