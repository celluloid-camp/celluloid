import InfoIcon from "@mui/icons-material/Info";
import { Grow, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import type * as React from "react";

export function EmptyAnnotation() {
  const t = useTranslations();
  return (
    <Grow in={true}>
      <Stack
        spacing={1}
        className="content-center items-center px-10 py-10 mb-2"
      >
        <InfoIcon className="text-[30px] text-gray-500" />
        <Typography variant="body2" className="text-center text-gray-500">
          {t("project.annotaions.empty")}
        </Typography>
      </Stack>
    </Grow>
  );
}
