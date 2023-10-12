import SendIcon from "@mui/icons-material/Send";
import {
  ClickAwayListener,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as React from "react";
import { useTranslation } from "react-i18next";
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
}

export const CommentForm: React.FC<CommentFormProps> = ({
  user,
  project,
  annotation,
}) => {
  const { t } = useTranslation();

  const utils = trpc.useContext();
  const mutation = trpc.comment.add.useMutation();

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .min(5, "Comment doit comporter minimum 5 character")
      .required("Commentaire est obligatoire"),
  });

  const formik = useFormik({
    initialValues: {
      comment: "",
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      console.log(project);
      const newComment = await mutation.mutateAsync({
        annotationId: annotation.id,
        projectId: project.id,
        comment: values.comment,
      });
      if (newComment) {
        formik.resetForm();
      }
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <ClickAwayListener onClickAway={() => formik.resetForm()}>
        <ListItem sx={{ pl: 4, py: 0 }}>
          <ListItemAvatar sx={{ minWidth: 35 }}>
            <UserAvatar username={user.username} userId={user.id} small />
          </ListItemAvatar>
          <ListItemText
            primary={
              <React.Fragment>
                <Typography component="span" color="white" variant="body2">
                  {user.username}
                </Typography>{" "}
              </React.Fragment>
            }
            secondary={
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
                  disabled={formik.isSubmitting}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Send"
                        onClick={() => formik.handleSubmit()}
                        disabled={formik.isSubmitting}
                        edge="end"
                        color="success"
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </React.Fragment>
            }
          />
        </ListItem>
      </ClickAwayListener>
    </form>
  );
};
