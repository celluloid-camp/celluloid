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
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import * as React from "react";
import { useState } from "react";
import * as Yup from "yup";
import { Avatar } from "@/components/common/avatar";
import { MultiLineTypography } from "@/components/common/multiline-typography";
import { TransparentInput } from "@/components/common/transparent-input";
import type { User } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type {
  AnnotationByProjectId,
  AnnotationCommentByProjectId,
  ProjectById,
} from "@/lib/trpc/types";

interface CommentItemProps {
  user?: Partial<User>;
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
  const t = useTranslations();
  const [hovering, setHovering] = useState(false);
  const [edition, setEdition] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const utils = trpc.useUtils();

  const editMutation = trpc.comment.edit.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
      enqueueSnackbar(t("comment.update.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("comment.update.error"), {
        variant: "error",
      });
    },
  });

  const deleteMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
      enqueueSnackbar(t("comment.delete.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("comment.delete.error"), {
        variant: "error",
      });
    },
  });

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .min(2, t("project.video.annotation.comment.minLength"))
      .required(t("project.video.annotation.comment.required")),
  });

  const formik = useFormik({
    initialValues: {
      comment: comment.text || "",
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
            </Typography>
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
            <form onSubmit={formik.handleSubmit}>
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
                    error={undefined}
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
                      {t("annotation.comment.cancel")}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      type="submit"
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
                    >
                      {t("annotation.comment.send")}
                    </Button>
                  </Box>
                </React.Fragment>
              )}
            </form>
          </React.Fragment>
        }
      />
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        {hovering &&
        !edition &&
        comment.user.id === user?.id &&
        !deleteMutation.isPending &&
        !editMutation.isPending ? (
          <Stack direction={"row"}>
            <Tooltip title={t("comment.tooltip.title.update")} arrow>
              <IconButton onClick={handleEdit}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title={t("comment.tooltip.title.delete")} arrow>
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
