import {
  Box,
  Button,
  ClickAwayListener,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useFormik } from "formik";
import * as React from "react";
import * as Yup from "yup";

import { Avatar } from "@/components/common/avatar";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { trpc } from "@/lib/trpc/client";
import { TransparentInput } from "@/components/common/transparent-input";
import type { User } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

interface CommentFormProps {
  user: User;
  project: ProjectById;
  annotation: AnnotationByProjectId;
  onClose: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  user,
  project,
  annotation,
  onClose,
}) => {
  const t = useTranslations();

  const utils = trpc.useUtils();
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
              <Avatar
                sx={{
                  background: user?.color,
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: user?.color,
                  borderStyle: "solid",
                }}
                src={user?.image}
              >
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
                    inputProps={{
                      "aria-label": "Saissez votre annotation",
                      maxLength: 250,
                    }}
                    maxRows={3}
                    minRows={1}
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
                {t("annotation.comment.cancel")}
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
                {t("annotation.comment.send")}
              </Button>
            </Box>
          </ListItem>
        </React.Fragment>
      </ClickAwayListener>
    </form>
  );
};
