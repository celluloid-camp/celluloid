import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Divider,
  Grow,
  IconButton,
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
import Image from "mui-image";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditableText } from "~components/editable-text";

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
  index: number;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  project,
  user,
  index,
}) => {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);

  const confirm = useConfirm();
  const utils = trpc.useUtils();

  const editMutation = trpc.chapter.edit.useMutation({
    onSuccess: () => {
      utils.chapter.byProjectId.invalidate({ projectId: project.id });
    },
  });

  const deleteMutation = trpc.chapter.delete.useMutation({
    onSuccess: () => {
      utils.chapter.byProjectId.invalidate({ projectId: project.id });
    },
  });

  const handleEdit = async (field: "title" | "description", value: string) => {
    try {
      await editMutation.mutateAsync({
        chapterId: chapter.id,
        [field]: value,
        projectId: project.id,
      });
    } catch (error) {
      // Revert optimistic update on error
      utils.chapter.byProjectId.invalidate({ projectId: project.id });
    }
  };

  const canEdit = project.user.id === user?.id;

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    confirm({
      title: t("chapter.confirm-delete.title", "Supprimer le chapitre"),
      description: t(
        "chapter.confirm-delete.description",
        "Êtes-vous sûr(e) de vouloir supprimer le chapitre ?"
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
      deleteMutation.mutateAsync({
        chapterId: chapter.id,
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
        <ListItem
          disableGutters
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
            primary={
              <React.Fragment>
                <EditableText
                  textProps={{
                    color: "white",
                    variant: "body2",
                  }}
                  disabled={!canEdit}
                  value={chapter.title || `chapter`}
                  onSave={(e) => handleEdit("title", e)}
                  textFieldProps={{ sx: { color: "white" } }}
                />
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <EditableText
                  textProps={{ color: "gray", variant: "body2" }}
                  disabled={!canEdit}
                  value={chapter.description || "description"}
                  onSave={(e) => handleEdit("description", e)}
                  textFieldProps={{ multiline: true }}
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
            sx={{ minWidth: 40 }}
          >
            {hovering && canEdit ? (
              <Stack direction={"row"}>
                <Tooltip title="Supprimer" arrow>
                  <IconButton onClick={handleDelete}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : null}
          </Box>
        </ListItem>
      </Paper>
    </Grow>
  );
};
