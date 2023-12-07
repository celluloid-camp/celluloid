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
import { useFormik } from "formik";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";

import { useVideoPlayerProgressValue } from "~components/project/useVideoPlayer";
import { ProjectById, trpc, UserMe } from "~utils/trpc";

import { DurationSlider } from "./DurationSlider";
import {
  useAnnotationFormVisible,
  useContextualEditorPosition,
  useContextualEditorVisibleState,
  useEditAnnotation,
} from "./useAnnotationEditor";

type AnnotationFormProps = {
  duration: number;
  project: ProjectById;
  user: UserMe;
};

export const AnnotationForm: React.FC<AnnotationFormProps> = (props) => {
  const [showForm, setShowForm] = useAnnotationFormVisible();

  const { t } = useTranslation();

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
        sx={{ mx: 5 }}
        startIcon={<RateReviewIcon />}
      >
        {t("annotation.form.add-annotation")}
      </Button>
    );
  } else {
    return <AnnotationFormContent onClose={handleClose} {...props} />;
  }
};

export const AnnotationFormContent: React.FC<
  AnnotationFormProps & { onClose: () => void }
> = ({ duration, project, onClose }) => {
  const utils = trpc.useUtils();
  const addMutation = trpc.annotation.add.useMutation();
  const editMutation = trpc.annotation.edit.useMutation();

  const [contextEditorVisible, setContextualEditorVisible] =
    useContextualEditorVisibleState();

  const [contextualEditorPosition, setContextualEditorPosition] =
    useContextualEditorPosition();

  const [editedAnnotation, setEditedAnnotation] = useEditAnnotation();

  const videoProgress = useVideoPlayerProgressValue();

  const validationSchema = Yup.object().shape({
    startTime: Yup.number(),
    stopTime: Yup.number(),
    pause: Yup.boolean(),
    text: Yup.string()
      .min(2, "Comment doit comporter minimum 5 character")
      .required("Commentaire est obligatoire"),
  });

  const formik = useFormik({
    initialValues: editedAnnotation
      ? {
          startTime: editedAnnotation.startTime,
          stopTime: editedAnnotation.stopTime,
          pause: editedAnnotation.pause,
          text: editedAnnotation.text,
        }
      : {
          startTime: videoProgress,
          stopTime: videoProgress + 600, // 10 minutes
          pause: true,
          text: "",
        },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      if (editedAnnotation) {
        const changedAnnotation = await editMutation.mutateAsync({
          annotationId: editedAnnotation.id,
          projectId: project.id,
          text: values.text,
          startTime: values.startTime,
          stopTime: values.stopTime,
          pause: values.pause,
          extra: contextualEditorPosition ? contextualEditorPosition : {},
        });
        if (changedAnnotation) {
          formik.resetForm();
          setContextualEditorPosition(undefined);
          setEditedAnnotation(undefined);
          handleClose();
        }
      } else {
        const newAnnotation = await addMutation.mutateAsync({
          projectId: project.id,
          text: values.text,
          startTime: values.startTime,
          stopTime: values.stopTime,
          pause: values.pause,
          extra: contextualEditorPosition ? contextualEditorPosition : {},
        });
        if (newAnnotation) {
          formik.resetForm();
          setContextualEditorPosition(undefined);
          handleClose();
        }
      }

      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const handleClickAway = () => {};

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
            placeholder="Saissez votre annotation"
            multiline
            maxRows={5}
            minRows={2}
            value={formik.values.text}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.text}
            disabled={formik.isSubmitting}
            inputProps={{
              "aria-label": "Saissez votre annotation",
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
            <Tooltip title="Placer un repère visuel" arrow>
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

            <Tooltip title={"Pause automatique à l'ouverture"} arrow>
              <FormControlLabel
                sx={{ color: "white" }}
                label="Pause"
                control={
                  <Checkbox
                    size="small"
                    color="secondary"
                    id="pause"
                    name="pause"
                    checked={formik.values.pause}
                    onChange={formik.handleChange}
                    icon={<PauseCircleOutlineOutlinedIcon />}
                    checkedIcon={<PauseCircleIcon />}
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
              <Trans i18nKey="annotation.create.cancel">Annuler</Trans>
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
              {editedAnnotation ? (
                <Trans i18nKey="annotation.edit.send">Modifier</Trans>
              ) : (
                <Trans i18nKey="annotation.create.send">Envoyer</Trans>
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};
