import InfoIcon from "@mui/icons-material/Info";
import { Button, Grow, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useTRPC } from "@/lib/trpc/client";
import { ProjectById } from "@/lib/trpc/types";

export function ScenesProcessingFailed({ project }: { project: ProjectById }) {
  const api = useTRPC();
  const mutation = useMutation(api.chapter.generate.mutationOptions());
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    await mutation.mutateAsync({ projectId: project.id });

    enqueueSnackbar(t("confirm.generation.sent"), {
      variant: "success",
    });

    queryClient.invalidateQueries(
      api.project.byId.queryFilter({ id: project.id }),
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
          {t("project.chapters.failed")}
        </Typography>
        {project.editable ? (
          <Button variant="outlined" color="primary" onClick={handleGenerate}>
            {t("project.chapters.retry")}{" "}
          </Button>
        ) : null}
      </Stack>
    </Grow>
  );
}
