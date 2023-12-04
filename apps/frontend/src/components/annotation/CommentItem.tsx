import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import dayjs from "dayjs";
import { useFormik } from "formik";
import * as React from "react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";

import { Avatar } from "~components/Avatar";
import { MultiLineTypography } from "~components/MultiLineTypography";
import { TransparentInput } from "~components/TransparentInput";
import {
  AnnotationByProjectId,
  AnnotationCommentByProjectId,
  ProjectById,
  trpc,
  UserMe,
} from "~utils/trpc";

interface CommentItemProps {
  user?: UserMe;
  project: ProjectById;
  comment: AnnotationCommentByProjectId;
  annotation: AnnotationByProjectId;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  project,
  user,
  annotation,
}) => {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);
  const [edition, setEdition] = useState(false);

  const utils = trpc.useUtils();

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

  const handleClose = () => {
    setEdition(false);
  };

  return (
    <ListItem
      sx={{ pl: 4, py: 0, alignItems: "flex-start" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <ListItemAvatar sx={{ minWidth: 35, marginTop: 2 }}>
        <Avatar
          sx={{
            background: comment.user.color,
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: comment.user.color,
            borderStyle: "solid",
          }}
          src={comment.user.avatar?.publicUrl}
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
              <MultiLineTypography
                variant="body2"
                color="gray"
                text={comment.text}
              />
            ) : (
              <React.Fragment>
                <TransparentInput
                  id="comment"
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.comment}
                  unpadded={true}
                  inputProps={{
                    "aria-label": "Saissez votre annotation",
                    maxLength: 250,
                  }}
                  maxRows={5}
                  minRows={2}
                  placeholder={t("annotation.commentPlaceholder") || ""}
                />
                <Box
                  display={"flex"}
                  justifyContent={"flex-end"}
                  sx={{ pt: 1 }}
                >
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
              </React.Fragment>
            )}
          </React.Fragment>
        }
      />
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        {hovering &&
        !edition &&
        comment.user.id == user?.id &&
        !deleteMutation.isLoading &&
        !editMutation.isLoading ? (
          <Stack direction={"row"}>
            <Tooltip title="Modifier" arrow>
              <IconButton onClick={handleEdit}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem light />
            <Tooltip title="Supprimer" arrow>
              <IconButton onClick={handleDelete}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null}
      </Box>
    </ListItem>
  );
};
