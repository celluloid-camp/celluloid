import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Divider,
  Grow,
  IconButton,
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
import Image from "mui-image";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MultiLineTypography } from "~components/MultiLineTypography";
import { formatDuration } from "~utils/DurationUtils";
import {
  type ChapterByProjectId,
  type ProjectById,
  trpc,
  type UserMe,
} from "~utils/trpc";

interface ChapterItemProps {
  project: ProjectById;
  chapter: ChapterByProjectId;
  user?: UserMe;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  project,
  user,
}) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);

  // const [editedAnnotation, setEditedAnnotation] = useEditAnnotation();

  const confirm = useConfirm();
  const utils = trpc.useUtils();

  const handleEdit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    // setEditedAnnotation(annotation);
  };

  const mutation = trpc.annotation.delete.useMutation({
    onSuccess: () => {
      utils.annotation.byProjectId.invalidate({ id: project.id });
    },
  });

  const canEdit = project.user.id === user?.id;

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
        annotationId: chapter.id,
      });
    });
  };

  return (
    <Grow in={true}>
      <Paper
        sx={() => ({
          borderRadius: 1,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: grey[800],
          backgroundColor: grey[900],
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
          <ListItemText
            primaryTypographyProps={{
              color: "white",
              fontWeight: "medium",
              variant: "body1",
            }}
            primary={
              <React.Fragment>
                <Typography component="span" color="white" variant="body2">
                  {chapter.title}
                </Typography>{" "}
              </React.Fragment>
            }
            secondaryTypographyProps={{ paddingRight: 1 }}
            secondary={
              <React.Fragment>
                <MultiLineTypography
                  variant="body2"
                  color="gray"
                  text={chapter.title || "chapter 1"}
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
            ) : null}
            {/* {annotation.comments.length > 0 ? (
              collapsed ? (
                <ExpandLess sx={{ color: "gray" }} />
              ) : (
                <ExpandMore sx={{ color: "gray" }} />
              )
            ) : null} */}
          </Box>
        </ListItemButton>
      </Paper>
    </Grow>
  );
};
