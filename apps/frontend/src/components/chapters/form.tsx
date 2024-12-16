import { Box, Button, ClickAwayListener, InputBase, Fade } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import {
  type ChapterByProjectId,
  type ProjectById,
  trpc,
  type UserMe,
} from "~utils/trpc";

import { ChapterTimestampSlider } from "./slider";
import { useState } from "react";
import { useConfirm } from "material-ui-confirm";

type ChapterFormProps = {
  project: ProjectById;
  user?: UserMe;
  chapters: ChapterByProjectId[];
};

export const ChapterForm: React.FC<ChapterFormProps> = (props) => {
  const [showForm, setShowForm] = useState(false);

  const confirm = useConfirm();
  const { t } = useTranslation();

  const utils = trpc.useUtils();
  const resetMutation = trpc.chapter.reset.useMutation();

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
    }).then(async () => {
      await resetMutation.mutateAsync(
        { projectId: props.project.id },
        {
          onSuccess: () => {
            utils.chapter.byProjectId.invalidate({
              projectId: props.project.id,
            });
          },
        }
      );
    });
  };

  return (
    <>
      <Fade in={!showForm} timeout={300}>
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
              disabled={resetMutation.isLoading}
            >
              {t("chapters.form.button.reset")}
            </Button>
          )}
        </Box>
      </Fade>
      <Fade in={showForm} timeout={300}>
        <Box sx={{ display: !showForm ? "none" : "block" }}>
          <ChapterFormContent onClose={handleClose} {...props} />
        </Box>
      </Fade>
    </>
  );
};

export const ChapterFormContent: React.FC<
  ChapterFormProps & { onClose: () => void }
> = ({ project, onClose }) => {
  const utils = trpc.useUtils();
  const createMutation = trpc.chapter.create.useMutation();

  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    startTime: Yup.number(),
    stopTime: Yup.number(),
    title: Yup.string()
      .min(2, "Title must be at least 2 characters")
      .required("Title is required"),
    description: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      startTime: 0,
      stopTime: 600, // 10 minutes
      title: "",
      description: "",
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      const newChapter = await createMutation.mutateAsync({
        projectId: project.id,
        title: values.title,
        description: values.description,
        startTime: values.startTime,
        endTime: values.stopTime,
      });
      if (newChapter) {
        formik.resetForm();
        handleClose();
      }
      utils.chapter.byProjectId.invalidate({ projectId: project.id });
    },
  });

  const handleClickAway = () => {};

  const handleClose = () => {
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
          <ChapterTimestampSlider
            duration={project.duration}
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
            id="title"
            name="title"
            sx={{ ml: 1, flex: 1, color: "white" }}
            placeholder={t("chapters.form.title.placeholder")}
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.title}
            disabled={formik.isSubmitting}
            inputProps={{
              "aria-label": "Title",
              maxLength: 250,
            }}
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
            id="description"
            name="description"
            sx={{ ml: 1, flex: 1, color: "white" }}
            placeholder={t("chapters.form.description.placeholder")}
            multiline
            maxRows={5}
            minRows={2}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.description}
            disabled={formik.isSubmitting}
            inputProps={{
              "aria-label": "Chapter description",
              maxLength: 250,
            }}
          />
        </Box>

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
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
              <Trans i18nKey="annotation.create.send">Envoyer</Trans>
            </Button>
          </Box>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};
