import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FilterTiltShiftIcon from "@mui/icons-material/FilterTiltShift";
import ReplyIcon from "@mui/icons-material/Reply";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grow,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import * as dayjs from "dayjs";
import { useConfirm } from "material-ui-confirm";
import * as React from "react";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";

import { MultiLineTypography } from "~components/MultiLineTypography";
import { formatDuration } from "~utils/DurationUtils";
import {
  AnnotationByProjectIdItem,
  ProjectById,
  trpc,
  UserMe,
} from "~utils/trpc";

import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface AnnotationItemProps {
  project: ProjectById;
  annotation: AnnotationByProjectIdItem;
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

  const confirm = useConfirm();
  const utils = trpc.useContext();

  const handleEdit = () => {};

  const mutation = trpc.annotation.delete.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const isContextual = Object.keys(annotation.extra || {}).length;

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
          }}
        >
          <ListItemAvatar>
            <Avatar sx={{ background: annotation.user.color, marginTop: 1 }}>
              {annotation.user.initial}
            </Avatar>
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
            sx={{ minWidth: 100 }}
          >
            {hovering && annotation.user.id == user?.id ? (
              <Stack direction={"row"}>
                <Tooltip title="Modifier" arrow>
                  <IconButton onClick={handleEdit} disabled>
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
            {annotation.comments.map((comment: AnnotationByProjectIdItem) => (
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
            ))}
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
                      Répondre
                    </Button>
                  </ListItem>
                ) : (
                  <CommentForm
                    user={user}
                    annotation={annotation}
                    project={project}
                    onClose={() => setShowReplyForm(false)}
                  />
                )}
              </React.Fragment>
            ) : null}
          </Collapse>
        ) : null}
      </Paper>
    </Grow>
  );
};
