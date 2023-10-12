import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  Grow,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import * as dayjs from "dayjs";
import * as React from "react";
import { useMemo, useState } from "react";

import { UserAvatar } from "~components/UserAvatar";
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
  editable: boolean;
}

export const AnnotationItem: React.FC<AnnotationItemProps> = ({
  annotation,
  project,
  user,
  editable = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleEdit = () => {};

  const handleDelete = () => {};

  const canCreateComment = useMemo(() => user, [user]);
  return (
    <Grow in={true}>
      <Box
        sx={{
          paddingY: 0.5,
          borderRadius: 1,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: grey[800],
          marginBottom: 1,
        }}
      >
        <ListItemButton
          disableGutters
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          sx={
            collapsed
              ? {
                  borderBottomStyle: "solid",
                  borderBottomWidth: 1,
                  borderBottomColor: grey[800],
                  paddingX: 2,
                }
              : {
                  paddingX: 2,
                }
          }
        >
          <ListItemAvatar>
            <UserAvatar
              username={annotation.user.username}
              userId={annotation.user.id}
            />
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
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  fontWeight="medium"
                  variant="caption"
                  color="gray"
                >
                  {"-"} {dayjs(annotation.createdAt).fromNow()}
                </Typography>
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="gray"
                >
                  {annotation.text}
                </Typography>
              </React.Fragment>
            }
          />
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            {hovering ? (
              <Stack direction={"row"}>
                <IconButton onClick={handleEdit}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton onClick={handleDelete}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            ) : (
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
            )}

            {annotation.comments.length > 0 ? (
              collapsed ? (
                <ExpandLess sx={{ color: "gray" }} />
              ) : (
                <ExpandMore sx={{ color: "gray" }} />
              )
            ) : null}
          </Box>
        </ListItemButton>
        <Collapse in={collapsed} timeout="auto" unmountOnExit>
          {annotation.comments.map((comment: AnnotationByProjectIdItem) => (
            <List component="div" disablePadding sx={{ padding: 0 }}>
              <CommentItem
                comment={comment}
                project={project}
                annotation={annotation}
              />
            </List>
          ))}
          {canCreateComment && (
            <CommentForm
              user={user}
              annotation={annotation}
              project={project}
            />
          )}
        </Collapse>
      </Box>
    </Grow>
  );
};
