import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterTiltShiftIcon from "@mui/icons-material/FilterTiltShift";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Grow,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import dayjs from "dayjs";
import { useConfirm } from "material-ui-confirm";
import * as React from "react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Avatar } from "~components/Avatar";
import { MultiLineTypography } from "~components/MultiLineTypography";
import { formatDuration } from "~utils/DurationUtils";
import {
  type AnnotationByProjectId,
  type AnnotationCommentByProjectId,
  type ProjectById,
  trpc,
  type UserMe,
} from "~utils/trpc";

import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { useEditAnnotation } from "./useAnnotationEditor";
import { getEmojiFromName } from "../emotion-detection/emoji";

interface AnnotationItemProps {
  project: ProjectById;
  annotation: AnnotationByProjectId;
  user?: UserMe;
}

export const AnnotationItem: React.FC<AnnotationItemProps> = ({
  annotation,
  project,
  user,
}) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editedAnnotation, setEditedAnnotation] = useEditAnnotation();

  const confirm = useConfirm();
  const utils = trpc.useUtils();

  const handleEdit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    setEditedAnnotation(annotation);
  };

  const mutation = trpc.annotation.delete.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const isContextual = Object.keys(annotation.extra?.x || {}).length;

  const canEdit =
    annotation.user.id === user?.id || project.user.id === user?.id;

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    confirm({
      title: t("annotation.confirm-delete.title", "Supprimer l'annotation"),
      description: t(
        "annotation.confirm-delete.description",
        "Êtes-vous sûr(e) de vouloir supprimer l'annotation ?"
      ),
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
    }).then(() => {
      mutation.mutateAsync({
        annotationId: annotation.id,
      });
    });
  };

  return (
    <Grow in={true}>
      <Paper
        sx={({ theme }) => ({
          paddingY: 0.5,
          borderRadius: 1,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: isContextual ? "warning.main" : grey[800],
          backgroundColor: grey[900],
          marginBottom: 1,
        })}
      >
        <ListItemButton
          disableGutters
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          sx={{
            paddingX: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <ListItemAvatar sx={{ position: "relative" }}>
            <Avatar
              sx={{
                background: annotation.user.color,
                marginTop: 1,
                borderWidth: 2,
                borderColor: annotation.user.color,
                borderStyle: "solid",
              }}
              src={annotation.user.avatar?.publicUrl}
            >
              {annotation.user.initial}
            </Avatar>
            {annotation.emotion && (
              <Tooltip title={annotation.emotion} placement="top" arrow>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -10,
                    right: 10,
                    color: "white",
                    backgroundColor: "#000000",
                    borderRadius: "100%",
                    width: 25,
                    height: 25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getEmojiFromName(annotation.emotion)}
                </Box>
              </Tooltip>
            )}
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{
              color: "white",
              fontWeight: "medium",
              variant: "body1",
            }}
            primary={
              <React.Fragment>
                <Typography component="span" color="white" variant="body2">
                  {annotation.user.username}
                </Typography>{" "}
                <Typography fontWeight="medium" variant="caption" color="gray">
                  {"-"} {dayjs(annotation.createdAt).fromNow()}
                </Typography>
              </React.Fragment>
            }
            secondaryTypographyProps={{ paddingRight: 1 }}
            secondary={
              <React.Fragment>
                <MultiLineTypography
                  variant="body2"
                  color="gray"
                  text={annotation.text}
                />
              </React.Fragment>
            }
          />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            alignContent={"center"}
            justifyContent={"center"}
            sx={{ minWidth: 100 }}
          >
            {hovering && canEdit ? (
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
            ) : (
              <React.Fragment>
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="caption"
                  color="gray"
                >
                  {formatDuration(annotation.startTime)}
                  {" → "}
                  {formatDuration(annotation.stopTime)}
                </Typography>

                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  {isContextual ? (
                    <FilterTiltShiftIcon
                      sx={{ color: "warning.main", fontSize: 15 }}
                    />
                  ) : null}
                  {annotation.pause ? (
                    <PauseCircleOutlineOutlinedIcon
                      sx={{ color: "grey.600", fontSize: 15 }}
                    />
                  ) : null}
                  {annotation.comments.length > 0 ? (
                    <Stack
                      direction={"row"}
                      spacing={0.5}
                      alignItems={"center"}
                    >
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="caption"
                        color="gray"
                      >
                        {annotation.comments.length}
                      </Typography>
                      <CommentIcon sx={{ color: "gray", fontSize: 15 }} />
                    </Stack>
                  ) : null}
                </Stack>
              </React.Fragment>
            )}
            {/* {annotation.comments.length > 0 ? (
              collapsed ? (
                <ExpandLess sx={{ color: "gray" }} />
              ) : (
                <ExpandMore sx={{ color: "gray" }} />
              )
            ) : null} */}
          </Box>
        </ListItemButton>

        {annotation.comments.length > 0 || project.commentable ? (
          <Collapse in={collapsed} timeout="auto" unmountOnExit>
            <Divider light textAlign="left"></Divider>
            {annotation.comments.map(
              (comment: AnnotationCommentByProjectId) => (
                <List
                  component="div"
                  disablePadding
                  sx={{ padding: 0 }}
                  key={comment.id}
                >
                  <CommentItem
                    user={user}
                    comment={comment}
                    project={project}
                    annotation={annotation}
                  />
                </List>
              )
            )}
            {project.commentable ? (
              <React.Fragment>
                {!showReplyForm ? (
                  <ListItem sx={{ justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant="text"
                      sx={{ fontSize: 12, color: grey[400] }}
                      onClick={() => setShowReplyForm(true)}
                      startIcon={<ReplyIcon />}
                    >
                      <Trans i18nKey="annotation.comment.reply">Répondre</Trans>
                    </Button>
                  </ListItem>
                ) : null}
                <Collapse in={showReplyForm} unmountOnExit>
                  <CommentForm
                    user={user}
                    annotation={annotation}
                    project={project}
                    onClose={() => setShowReplyForm(false)}
                  />
                </Collapse>
              </React.Fragment>
            ) : null}
          </Collapse>
        ) : null}
      </Paper>
    </Grow>
  );
};
