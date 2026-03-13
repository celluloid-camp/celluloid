"use client";

import { AnnotationShape } from "@celluloid/db";
import { zodResolver } from "@hookform/resolvers/zod";
import PlusIcon from "@mui/icons-material/Add";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CenterFocusStrongOutlinedIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  InputBase,
  Tooltip,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import { trpc } from "@/lib/trpc/server";
import type { ProjectById, UserMe } from "@/lib/trpc/types";
import { DurationSlider } from "./duration-slider";
import { useShapesStore } from "./shapes-store";
import {
  useAnnotationFormVisible,
  useContextualEditorVisibleState,
  useEditAnnotation,
} from "./useAnnotationEditor";

type AnnotationFormProps = {
  duration: number;
  project: ProjectById;
  user?: User;
};

export const AnnotationForm: React.FC<AnnotationFormProps> = (props) => {
  const [showForm, setShowForm] = useAnnotationFormVisible();

  const t = useTranslations();

  const handleOpen = () => {
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <Box
        sx={{
          borderTop: 1,
          borderColor: grey[800],
          pt: 2,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleOpen}
          color="secondary"
          sx={{ mx: 2 }}
          startIcon={<PlusIcon />}
        >
          {t("annotation.form.add-annotation")}
        </Button>
      </Box>
    );
  }
  return <AnnotationFormContent onClose={handleClose} {...props} />;
};

export const AnnotationFormContent: React.FC<
  AnnotationFormProps & { onClose: () => void }
> = ({ duration, project, onClose }) => {
  const api = useTRPC();

  const queryClient = useQueryClient();
  const addMutation = useMutation(api.annotation.add.mutationOptions());
  const editMutation = useMutation(api.annotation.edit.mutationOptions());

  const [contextEditorVisible, setContextualEditorVisible] =
    useContextualEditorVisibleState();

  const shapes = useShapesStore((state) => state.shapes);
  const initShapeEditor = useShapesStore((state) => state.init);
  const resetShapes = useShapesStore((state) => state.reset);

  const [editedAnnotation, setEditedAnnotation] = useEditAnnotation();

  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);

  const t = useTranslations();

  const annotationSchema = z.object({
    startTime: z.number(),
    stopTime: z.number(),
    pause: z.boolean(),
    text: z
      .string()
      .min(2, "Comment doit comporter minimum 5 character")
      .nonempty("Commentaire est obligatoire"),
  });

  type AnnotationFormValues = z.infer<typeof annotationSchema>;

  useEffect(() => {
    if (editedAnnotation) {
      initShapeEditor([editedAnnotation.extra as AnnotationShape]);
    }
  }, [editedAnnotation]);

  const defaultValues: AnnotationFormValues = editedAnnotation
    ? {
        startTime: editedAnnotation.startTime,
        stopTime: editedAnnotation.stopTime,
        pause: editedAnnotation.pause,
        text: editedAnnotation.text,
      }
    : {
        startTime: mediaCurrentTime ?? 0,
        stopTime: (mediaCurrentTime ?? 0) + 600,
        pause: true,
        text: "",
      };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<AnnotationFormValues>({
    resolver: zodResolver(annotationSchema),
    mode: "onChange",
    defaultValues,
  });

  const shapesRequiredError = contextEditorVisible && shapes.length === 0;

  const onSubmit = async (values: AnnotationFormValues) => {
    if (shapesRequiredError) {
      return;
    }

    const pause = contextEditorVisible ? true : values.pause;

    if (editedAnnotation) {
      const changedAnnotation = await editMutation.mutateAsync({
        annotationId: editedAnnotation.id,
        projectId: project.id,
        text: values.text,
        startTime: values.startTime,
        stopTime: values.stopTime,
        pause,
        extra: shapes.length > 0 ? shapes[0] : null,
      });
      if (changedAnnotation) {
        reset(defaultValues);
        resetShapes();
        setEditedAnnotation(undefined);
        handleClose();
      }
    } else {
      const newAnnotation = await addMutation.mutateAsync({
        projectId: project.id,
        text: values.text,
        startTime: values.startTime,
        stopTime: values.stopTime,
        pause,
        extra: shapes.length > 0 ? shapes[0] : null,
      });
      if (newAnnotation) {
        reset(defaultValues);
        resetShapes();
        handleClose();
      }
    }

    queryClient.invalidateQueries(
      api.annotation.byProjectId.queryFilter({ id: project.id }),
    );
  };

  const handleClickAway = () => {
    //TODO: handle click away
  };

  const handleClose = () => {
    setContextualEditorVisible(false);
    onClose();
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          flexShrink: 0,
          pt: 2,
          paddingX: 2,
          borderTop: 1,
          borderColor: grey[800],
        }}
      >
        <Box sx={{ paddingX: 0, pb: 2 }}>
          <DurationSlider
            duration={duration}
            startTime={watch("startTime")}
            stopTime={watch("stopTime")}
            onChange={(start, stop) => {
              setValue("startTime", start);
              setValue("stopTime", stop);
            }}
            mono={contextEditorVisible}
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
            id="text"
            {...register("text")}
            sx={{ ml: 1, flex: 1, color: "white" }}
            placeholder={t("annotation.contentPlaceholder")}
            multiline
            maxRows={5}
            minRows={2}
            error={!!errors.text}
            disabled={isSubmitting}
            inputProps={{
              maxLength: 250,
            }}
          />
        </Box>

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box>
            <Tooltip title={t("annotation.form.context.tooltip")} arrow>
              <FormControlLabel
                label="Contexte"
                sx={{ color: "white" }}
                checked={contextEditorVisible}
                onChange={(_, v) =>
                  setContextualEditorVisible(!contextEditorVisible)
                }
                control={
                  <Checkbox
                    size="small"
                    icon={<CenterFocusStrongOutlinedIcon />}
                    checkedIcon={<CenterFocusStrongIcon color="secondary" />}
                  />
                }
              />
            </Tooltip>

            <Tooltip title={t("annotation.form.pause.tooltip")} arrow>
              <FormControlLabel
                disabled={contextEditorVisible}
                sx={{
                  color: "white",
                  "&.Mui-disabled .MuiFormControlLabel-label": {
                    color: "white",
                    opacity: 0.6,
                  },
                }}
                label="Pause"
                control={
                  <Checkbox
                    size="small"
                    color="secondary"
                    id="pause"
                    name="pause"
                    checked={contextEditorVisible ? true : watch("pause")}
                    disabled={contextEditorVisible}
                    onChange={(_, checked) => setValue("pause", checked)}
                    icon={<PauseCircleOutlineOutlinedIcon />}
                    checkedIcon={<PauseCircleIcon />}
                    sx={{
                      "&.Mui-disabled": {
                        color: "secondary.main",
                        opacity: 0.5,
                      },
                    }}
                  />
                }
              />
            </Tooltip>
          </Box>
          <Box sx={{ marginY: 1 }}>
            <Button
              size="small"
              onClick={handleClose}
              sx={{
                color: grey[500],
              }}
            >
              {t("annotation.create.cancel")}
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={!isValid || isSubmitting || shapesRequiredError}
              disableElevation
              sx={{
                borderRadius: 10,
                "&:disabled": {
                  color: grey[500],
                  backgroundColor: grey[700],
                },
              }}
              onClick={handleSubmit(onSubmit)}
            >
              {editedAnnotation
                ? t("annotation.edit.send")
                : t("annotation.create.send")}
            </Button>
          </Box>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};
