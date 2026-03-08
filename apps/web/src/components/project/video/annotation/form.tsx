"use client";

import { AnnotationShape } from "@celluloid/db";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CenterFocusStrongOutlinedIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
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
import { useFormik } from "formik";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import * as Yup from "yup";
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
      <Button
        variant="outlined"
        onClick={handleOpen}
        color="secondary"
        sx={{ mx: 2 }}
        startIcon={<RateReviewIcon />}
      >
        {t("annotation.form.add-annotation")}
      </Button>
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
  const validationSchema = Yup.object().shape({
    startTime: Yup.number(),
    stopTime: Yup.number(),
    pause: Yup.boolean(),
    text: Yup.string()
      .min(2, "Comment doit comporter minimum 5 character")
      .required("Commentaire est obligatoire"),
  });

  useEffect(() => {
    if (editedAnnotation) {
      initShapeEditor([editedAnnotation.extra as AnnotationShape]);
    }
  }, [editedAnnotation]);

  const formik = useFormik({
    initialValues: editedAnnotation
      ? {
          startTime: editedAnnotation.startTime,
          stopTime: editedAnnotation.stopTime,
          pause: editedAnnotation.pause,
          text: editedAnnotation.text,
        }
      : {
          startTime: mediaCurrentTime ?? 0,
          stopTime: (mediaCurrentTime ?? 0) + 600, // 10 minutes
          pause: true,
          text: "",
        },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
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
          formik.resetForm();
          // setContextualEditorPosition(undefined);
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
          formik.resetForm();
          // setContextualEditorPosition(undefined);
          resetShapes();
          handleClose();
        }
      }

      queryClient.invalidateQueries(
        api.annotation.byProjectId.queryFilter({ id: project.id }),
      );
    },
  });

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
        onSubmit={formik.handleSubmit}
        sx={{ flexShrink: 0, pt: 5, paddingX: 2 }}
      >
        <Box sx={{ paddingX: 2 }}>
          <DurationSlider
            duration={duration}
            startTime={formik.values.startTime}
            stopTime={formik.values.stopTime}
            onChange={(start, stop) => {
              formik.setFieldValue("startTime", start);
              formik.setFieldValue("stopTime", stop);
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
            name="text"
            sx={{ ml: 1, flex: 1, color: "white" }}
            placeholder={t("annotation.contentPlaceholder")}
            multiline
            maxRows={5}
            minRows={2}
            value={formik.values.text}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.text}
            disabled={formik.isSubmitting}
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
                    checked={contextEditorVisible ? true : formik.values.pause}
                    disabled={contextEditorVisible}
                    onChange={formik.handleChange}
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
              disabled={!formik.isValid || formik.isSubmitting}
              disableElevation
              sx={{
                borderRadius: 10,
                "&:disabled": {
                  color: grey[500],
                  backgroundColor: grey[700],
                },
              }}
              onClick={() => formik.handleSubmit()}
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
