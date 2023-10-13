import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CenterFocusStrongOutlinedIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  InputBase,
  Slider,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useFormik } from "formik";
import * as React from "react";
import { forwardRef, useState } from "react";
import * as Yup from "yup";

import {
  AnnotationByProjectIdItem,
  ProjectById,
  trpc,
  UserMe,
} from "~utils/trpc";

import { DurationSlider } from "./DurationSlider";

type AnnotationFormProps = {
  duration: number;
  project: ProjectById;
  user: UserMe;
};

export const AnnotationForm = forwardRef(
  ({ duration, project }: AnnotationFormProps, ref) => {
    const [showForm, setShowForm] = useState(false);

    const utils = trpc.useContext();
    const mutation = trpc.annotation.add.useMutation();

    const validationSchema = Yup.object().shape({
      startTime: Yup.number(),
      stopTime: Yup.number(),
      pause: Yup.boolean(),
      text: Yup.string()
        .min(5, "Comment doit comporter minimum 5 character")
        .required("Commentaire est obligatoire"),
    });

    const formik = useFormik({
      initialValues: {
        startTime: 0,
        stopTime: 0,
        pause: true,
        text: "",
      },
      validateOnMount: false,
      validationSchema: validationSchema,
      validateOnBlur: true,
      validateOnChange: true,
      onSubmit: async (values) => {
        const newAnnotation = await mutation.mutateAsync({
          projectId: project.id,
          text: values.text,
          startTime: values.startTime,
          stopTime: values.stopTime,
          pause: values.pause,
        });
        if (newAnnotation) {
          formik.resetForm();
        }
        utils.annotation.byProjectId.invalidate({ id: project.id });
      },
    });

    if (!showForm) {
      return (
        <Button onClick={() => setShowForm(true)}>
          Ajouter une annotation
        </Button>
      );
    } else {
      return (
        <form onSubmit={formik.handleSubmit}>
          <ClickAwayListener onClickAway={() => setShowForm(false)}>
            <Box
              component="form"
              ref={ref}
              sx={{ flexShrink: 0, pt: 5, paddingX: 2 }}
            >
              <Box sx={{ paddingX: 2 }}>
                <DurationSlider
                  duration={duration}
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
                  value={formik.values.text}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.comment}
                  disabled={formik.isSubmitting}
                  inputProps={{ "aria-label": "Saissez votre annotation" }}
                />
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  onClick={() => formik.handleSubmit()}
                >
                  <SendIcon />
                </IconButton>
              </Box>

              <div>
                <FormControlLabel
                  label="Ajouter contexte"
                  sx={{ color: "white" }}
                  control={
                    <Checkbox
                      icon={<CenterFocusStrongOutlinedIcon />}
                      checkedIcon={<CenterFocusStrongIcon color="secondary" />}
                    />
                  }
                />

                <FormControlLabel
                  sx={{ color: "white" }}
                  label="Mettre en pause ?"
                  control={
                    <Checkbox
                      color="secondary"
                      id="pause"
                      name="pause"
                      checked={formik.values.pause}
                      onChange={formik.handleChange}
                    />
                  }
                />
              </div>
            </Box>
          </ClickAwayListener>
        </form>
      );
    }
  }
);
