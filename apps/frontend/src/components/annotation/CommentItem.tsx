import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import * as dayjs from "dayjs";
import { useFormik } from "formik";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import { TransparentInput } from "~components/TransparentInput";
import { UserAvatar } from "~components/UserAvatar";
import {
  AnnotationByProjectIdItem,
  AnnotationCommentByProjectIdItem,
  ProjectById,
  trpc,
} from "~utils/trpc";

interface CommentItemProps {
  user: UserMe;
  project: ProjectById;
  comment: AnnotationCommentByProjectIdItem;
  annotation: AnnotationByProjectIdItem;
  editable: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  project,
  annotation,
  user,
  editable = true,
}) => {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);
  const [edition, setEdition] = useState(false);

  const utils = trpc.useContext();

  const editMutation = trpc.comment.edit.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const deleteMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .min(5, "Comment doit comporter minimum 5 character")
      .required("Commentaire est obligatoire"),
  });

  const formik = useFormik({
    initialValues: {
      comment: comment.text,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      await editMutation.mutateAsync({
        id: comment.id,
        annotationId: annotation.id,
        projectId: project.id,
        comment: values.comment,
      });
      formik.resetForm();
      setEdition(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({
      commentId: comment.id,
    });
  };

  const handleEdit = () => {
    setEdition(true);
  };

  return (
    <ClickAwayListener onClickAway={() => setEdition(false)}>
      <ListItem
        sx={{ pl: 4, py: 0 }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <ListItemAvatar sx={{ minWidth: 35 }}>
          <Avatar
            sx={{ background: comment.user.color, width: 24, height: 24 }}
          >
            {comment.user.initial}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <React.Fragment>
              <Typography component="span" color="white" variant="body2">
                {comment.user.username}
              </Typography>{" "}
              <Typography
                sx={{ display: "inline" }}
                component="span"
                fontWeight="medium"
                variant="caption"
                color="gray"
              >
                {"-"} {dayjs(comment.createdAt).fromNow()}
              </Typography>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              {!edition ? (
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="gray"
                >
                  {comment.text}
                </Typography>
              ) : (
                <TransparentInput
                  id="comment"
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.comment}
                  unpadded={true}
                  placeholder={t("annotation.commentPlaceholder") || ""}
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
              )}
            </React.Fragment>
          }
        />
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          {hovering &&
          !edition &&
          !deleteMutation.isSubmitting &&
          !editMutation.isSubmitting ? (
            <Stack direction={"row"}>
              <Tooltip title="Modifier" arrow>
                <IconButton onClick={handleEdit}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer" arrow>
                <IconButton onClick={handleDelete}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : null}
        </Box>
      </ListItem>
    </ClickAwayListener>
  );
};
