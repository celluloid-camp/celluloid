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
        alignContent={"center"}
        alignItems={"center"}
        sx={{
          paddingY: 5,
          paddingX: 5,
          marginBottom: 1,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t("project.annotaions.empty")}
        </Typography>
      </Stack>
    </Grow>
  );
}
