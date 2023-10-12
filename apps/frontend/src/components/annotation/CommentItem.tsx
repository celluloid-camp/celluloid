import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import * as dayjs from "dayjs";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TransparentInput } from "~components/TransparentInput";
import { UserAvatar } from "~components/UserAvatar";
import {
  AnnotationByProjectIdItem,
  AnnotationCommentByProjectIdItem,
  ProjectById,
  trpc,
} from "~utils/trpc";

interface CommentItemProps {
  project: ProjectById;
  comment: AnnotationCommentByProjectIdItem;
  annotation: AnnotationByProjectIdItem;
  editable: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  project,
  editable = true,
}) => {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);
  const [edition, setEdition] = useState(false);

  const [text, setText] = useState(comment.text || "");

  const utils = trpc.useContext();

  const mutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const handleDelete = () => {
    mutation.mutate({
      commentId: comment.id,
    });
  };

  const onTextChange = (value: string) => {
    if (text === "") {
      //onChange();
    }
    setText(value);
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
          <UserAvatar
            username={comment.user.username}
            userId={comment.user.id}
            small
          />
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
                  value={comment.text}
                  unpadded={true}
                  onChange={onTextChange}
                  placeholder={t("annotation.commentPlaceholder") || ""}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Send"
                        onClick={handleEdit}
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
          {hovering && !edition && !mutation.isSubmitting ? (
            <Stack direction={"row"}>
              <IconButton onClick={handleEdit}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton onClick={handleDelete}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          ) : null}
        </Box>
      </ListItem>
    </ClickAwayListener>
  );
};
