import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTRPC } from "@/lib/trpc/client";
import type { ChapterByProjectId, ProjectById } from "@/lib/trpc/types";
import { ChapterTimestampSlider } from "./slider";

interface EditChapterDialogProps {
  project: ProjectById;
  chapter: ChapterByProjectId | null;
  open: boolean;
  onClose: () => void;
}

const editChapterSchema = z.object({
  title: z.string().min(2).max(250),
  description: z.string().max(250).optional().or(z.literal("")),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
});

type EditChapterFormValues = z.infer<typeof editChapterSchema>;

export function EditChapterDialog({
  project,
  chapter,
  open,
  onClose,
}: EditChapterDialogProps) {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const editMutation = useMutation(api.chapter.edit.mutationOptions());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm<EditChapterFormValues>({
    resolver: zodResolver(editChapterSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startTime: 0,
      endTime: 0,
    },
  });

  const startTime = watch("startTime");
  const stopTime = watch("endTime");

  useEffect(() => {
    if (chapter) {
      reset({
        title: chapter.title ?? "",
        description: chapter.description ?? "",
        startTime: chapter.startTime as number,
        endTime: chapter.endTime as number,
      });
    }
  }, [chapter, reset]);

  const onSubmit = async (values: EditChapterFormValues) => {
    if (!chapter) return;

    try {
      await editMutation.mutateAsync({
        chapterId: chapter.id,
        projectId: project.id,
        title: values.title,
        description: values.description,
        startTime: values.startTime,
        endTime: values.endTime,
      });
      queryClient.invalidateQueries(
        api.chapter.byProjectId.queryFilter({ projectId: project.id }),
      );
      onClose();
    } catch {
      queryClient.invalidateQueries(
        api.chapter.byProjectId.queryFilter({ projectId: project.id }),
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: "background.dark",
          color: "white",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "white",
          backgroundColor: "background.dark",
        }}
      >
        {t("chapters.form.edit.title")}
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "background.dark",
        }}
      >
        {chapter ? (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 1 }}
          >
            <Stack spacing={2}>
              <Box sx={{ paddingX: 1 }}>
                <ChapterTimestampSlider
                  duration={project.duration}
                  startTime={startTime}
                  sx={{ mt: 2 }}
                  stopTime={stopTime}
                  onChange={(start, stop) => {
                    setValue("startTime", start, { shouldValidate: true });
                    setValue("endTime", stop, { shouldValidate: true });
                  }}
                />
              </Box>
              <TextField
                label={t("chapters.form.title.label")}
                fullWidth
                size="small"
                inputProps={{ maxLength: 250 }}
                error={!!errors.title}
                helperText={errors.title?.message}
                InputLabelProps={{
                  sx: { color: grey[400] },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: grey[800],
                    color: "white",
                    "& fieldset": {
                      borderColor: grey[700],
                    },
                    "&:hover fieldset": {
                      borderColor: grey[500],
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                {...register("title")}
              />
              <TextField
                label={t("chapters.form.description.label")}
                fullWidth
                size="small"
                multiline
                minRows={3}
                inputProps={{ maxLength: 250 }}
                error={!!errors.description}
                helperText={errors.description?.message}
                InputLabelProps={{
                  sx: { color: grey[400] },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: grey[800],
                    color: "white",
                    "& fieldset": {
                      borderColor: grey[700],
                    },
                    "&:hover fieldset": {
                      borderColor: grey[500],
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                {...register("description")}
              />
            </Stack>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "background.dark",
        }}
      >
        <Button onClick={onClose} sx={{ color: grey[500] }}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={
            editMutation.isPending || isSubmitting || !isValid || !chapter
          }
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
