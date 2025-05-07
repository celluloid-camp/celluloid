import { trpc } from "@/lib/trpc/client";
import InfoIcon from "@mui/icons-material/Info";
import { Button, Grow, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import type * as React from "react";

import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";

export function CreateChaptersJob({
  projectId,
  canGenerate,
}: {
  projectId: string;
  canGenerate: boolean;
}) {
  const mutation = trpc.chapter.generateChapters.useMutation();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations();
  const utils = trpc.useUtils();

  const handleGenerate = async () => {
    await mutation.mutateAsync({ projectId: projectId });

    enqueueSnackbar(t("confirm.generation.sent"), {
      variant: "success",
    });

    utils.project.byId.invalidate({ id: projectId });
  };
  return (
    <Grow in={true}>
      <Stack
        spacing={1}
        alignContent={"center"}
        alignItems={"center"}
        sx={{
          paddingY: 5,
          paddingX: 5,
          borderRadius: 1,
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: grey[800],
          marginBottom: 1,
          margin: 2,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t("project.chapters.not-found")}
        </Typography>
        {canGenerate ? (
          <Button variant="contained" color="primary" onClick={handleGenerate}>
            {t("project.chapters.button.generate")}
          </Button>
        ) : null}
      </Stack>
    </Grow>
  );
}
