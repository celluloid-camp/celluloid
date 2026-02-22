import { zodResolver } from "@hookform/resolvers/zod";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  InputBase,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ChapterByProjectId, ProjectById, UserMe } from "@/lib/trpc/types";
import { ChapterTimestampSlider } from "./slider";

type ChapterFormProps = {
  project: ProjectById;
  user?: User;
  chapters: ChapterByProjectId[];
};

export const ChapterForm: React.FC<ChapterFormProps> = (props) => {
  const [showForm, setShowForm] = useState(false);

  const confirm = useConfirm();
  const t = useTranslations();

  const api = useTRPC();
  const queryClient = useQueryClient();
  const resetMutation = useMutation(api.chapter.reset.mutationOptions());

  const handleOpen = () => {
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const handleReset = () => {
    confirm({
      title: t("chapters.form.reset.confirm.title"),
      description: t("chapters.form.reset.confirm.description"),
      confirmationText: t("deleteAction"),
      cancellationText: t("cancelAction"),
      confirmationButtonProps: {
        variant: "contained",
        color: "error",
      },
      contentProps: {
        sx: {
          color: "white",
          backgroundColor: "background.dark",
        },
      },
      titleProps: {
        sx: {
          color: "white",
          backgroundColor: "background.dark",
        },
      },
      dialogActionsProps: {
        sx: {
          backgroundColor: "background.dark",
        },
      },
    }).then(async (value) => {
      if (value.confirmed) {
        await resetMutation.mutateAsync({
          projectId: props.project.id,
        });
        queryClient.invalidateQueries(
          api.chapter.byProjectId.queryFilter({
            projectId: props.project.id,
          }),
        );
      }
    });
  };

  return (
    <>
      <Fade in={!showForm} timeout={300} mountOnEnter unmountOnExit>
        <Box
          sx={{ display: showForm ? "none" : "block", flex: 1, paddingX: 2 }}
        >
          <Button
            variant="outlined"
            onClick={handleOpen}
            color="secondary"
            sx={{ width: "100%" }}
            startIcon={<BookmarksIcon />}
          >
            {t("chapters.form.button.add")}
          </Button>
          {props.chapters.length > 0 && (
            <Button
              size="small"
              variant="text"
              color="warning"
              onClick={handleReset}
              disabled={resetMutation.isPending}
            >
              {t("chapters.form.button.reset")}
            </Button>
          )}
        </Box>
      </Fade>
      <ChapterFormContent open={showForm} onClose={handleClose} {...props} />
    </>
  );
};

const createChapterSchema = z.object({
  startTime: z.number().nonnegative(),
  stopTime: z.number().nonnegative(),
  title: z.string().min(2, "Title must be at least 2 characters").max(250),
  description: z.string().max(250).optional().or(z.literal("")),
});

type CreateChapterFormValues = z.infer<typeof createChapterSchema>;

export const ChapterFormContent: React.FC<
  ChapterFormProps & {
    onClose: () => void;
    open: boolean;
  }
> = ({ project, onClose, open }) => {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const createMutation = useMutation(api.chapter.create.mutationOptions());

  const t = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm<CreateChapterFormValues>({
    resolver: zodResolver(createChapterSchema),
    mode: "onChange",
    defaultValues: {
      startTime: 0,
      stopTime: 600, // 10 minutes
      title: "",
      description: "",
    },
  });

  const startTime = watch("startTime");
  const stopTime = watch("stopTime");

  const onSubmit = async (values: CreateChapterFormValues) => {
    const newChapter = await createMutation.mutateAsync({
      projectId: project.id,
      title: values.title,
      description: values.description,
      startTime: values.startTime,
      endTime: values.stopTime,
    });
    if (newChapter) {
      reset();
      handleClose();
    }
    queryClient.invalidateQueries(
      api.chapter.byProjectId.queryFilter({ projectId: project.id }),
    );
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        {t("chapters.form.button.add")}
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "background.dark",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flexShrink: 0, paddingX: 2 }}
        >
          <Box sx={{ paddingX: 2 }}>
            <ChapterTimestampSlider
              duration={project.duration}
              startTime={startTime}
              stopTime={stopTime}
              sx={{ mt: 2 }}
              onChange={(start, stop) => {
                setValue("startTime", start, { shouldValidate: true });
                setValue("stopTime", stop, { shouldValidate: true });
              }}
            />
          </Box>
          <Box
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              backgroundColor: grey[800],
              borderRadius: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, color: "white" }}
              placeholder={t("chapters.form.title.placeholder")}
              disabled={isSubmitting}
              inputProps={{
                "aria-label": "Title",
                maxLength: 250,
              }}
              {...register("title")}
            />
          </Box>
          <Box
            sx={{
              p: "2px 4px",
              display: "flex",
              marginTop: 2,
              alignItems: "center",
              backgroundColor: grey[800],
              borderRadius: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, color: "white" }}
              placeholder={t("chapters.form.description.placeholder")}
              multiline
              maxRows={5}
              minRows={2}
              disabled={isSubmitting}
              inputProps={{
                "aria-label": "Chapter description",
                maxLength: 250,
              }}
              {...register("description")}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "background.dark",
        }}
      >
        <Button
          size="small"
          onClick={handleClose}
          sx={{
            color: grey[500],
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={!isValid || isSubmitting}
          disableElevation
          sx={{
            "&:disabled": {
              color: grey[500],
              backgroundColor: grey[700],
            },
          }}
          onClick={handleSubmit(onSubmit)}
        >
          {t("common.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
