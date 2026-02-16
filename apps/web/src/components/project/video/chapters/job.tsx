import InfoIcon from "@mui/icons-material/Info";
import { Button, Grow, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useTRPC } from "@/lib/trpc/client";

export function CreateChaptersJob({
  projectId,
  canGenerate,
}: {
  projectId: string;
  canGenerate: boolean;
}) {
  const api = useTRPC();
  const mutation = useMutation(api.chapter.generateChapters.mutationOptions());
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    await mutation.mutateAsync({ projectId: projectId });

    enqueueSnackbar(t("confirm.generation.sent"), {
      variant: "success",
    });

    queryClient.invalidateQueries(
      api.project.byId.queryFilter({ id: projectId }),
    );
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
