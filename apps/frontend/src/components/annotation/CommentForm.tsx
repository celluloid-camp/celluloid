import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useFormik } from "formik";
import * as React from "react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";

import { TransparentInput } from "~components/TransparentInput";
import { UserAvatar } from "~components/UserAvatar";
import {
  AnnotationByProjectIdItem,
  ProjectById,
  trpc,
  UserMe,
} from "~utils/trpc";

interface CommentFormProps {
  user: UserMe;
  project: ProjectById;
  annotation: AnnotationByProjectIdItem;
  onClose: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  user,
  project,
  annotation,
  onClose,
}) => {
  const { t } = useTranslation();

  const utils = trpc.useContext();
  const mutation = trpc.comment.add.useMutation();

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .min(2, "Comment doit comporter minimum 2 character")
      .required("Commentaire est obligatoire"),
  });

  const handleClose = () => {
    onClose();
  };

  const formik = useFormik({
    initialValues: {
      comment: "",
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      const newComment = await mutation.mutateAsync({
        annotationId: annotation.id,
        projectId: project.id,
        comment: values.comment,
      });
      if (newComment) {
        formik.resetForm();
        onClose();
      }
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <ClickAwayListener onClickAway={() => formik.resetForm()}>
        <React.Fragment>
          <ListItem sx={{ pl: 4, py: 0 }}>
            <ListItemAvatar sx={{ minWidth: 35 }}>
              <Avatar sx={{ background: user?.color, width: 24, height: 24 }}>
                {user?.initial}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <React.Fragment>
                  <TransparentInput
                    id="comment"
                    unpadded={true}
                    name="comment"
                    placeholder={t("annotation.commentPlaceholder") || ""}
                    value={formik.values.comment}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.comment}
                    sx={{ fontSize: 13 }}
                    disabled={formik.isSubmitting}
                    // endAdornment={
                    //   <InputAdornment position="end">
                    //     <IconButton
                    //       aria-label="Send"
                    //       onClick={() => formik.handleSubmit()}
                    //       disabled={formik.isSubmitting}
                    //       edge="end"
                    //       color="success"
                    //     >
                    //       <SendIcon />
                    //     </IconButton>
                    //   </InputAdornment>
                    // }
                  />
                </React.Fragment>
              }
            />
          </ListItem>
          <ListItem sx={{ pl: 0, py: 0.5, justifyContent: "flex-end" }}>
            <Box>
              <Button
                size="small"
                onClick={handleClose}
                sx={{
                  color: grey[500],
                  borderRadius: 10,
                  fontSize: 12,
                }}
              >
                <Trans i18nKey="annotation.comment.cancel">Annuler</Trans>
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!formik.isValid || formik.isSubmitting}
                disableElevation
                sx={{
                  borderRadius: 10,
                  fontSize: 12,
                  "&:disabled": {
                    color: grey[500],
                    backgroundColor: grey[700],
                  },
                }}
                onClick={() => formik.handleSubmit()}
              >
                <Trans i18nKey="annotation.comment.send">Envoyer</Trans>
              </Button>
            </Box>
          </ListItem>
        </React.Fragment>
      </ClickAwayListener>
    </form>
  );
};
