import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Grow,
  IconButton,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useState } from "react";
import { EditableText } from "@/components/common/editable-text";
import type { User } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { ChapterByProjectId, ProjectById, UserMe } from "@/lib/trpc/types";

interface ChapterItemProps {
  project: ProjectById;
  chapter: ChapterByProjectId;
  user?: User;
  index: number;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  project,
  user,
  index,
}) => {
  const t = useTranslations();
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

  const canEdit = project.user.id === user?.id || user?.role === "admin";

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    confirm({
      title: t("chapter.confirm-delete.title"),
      description: t("chapter.confirm-delete.description"),
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
    }).then(async (value) => {
      if (value.confirmed) {
        utils.chapter.byProjectId.setData(
          { projectId: project.id },
          (oldData) => oldData?.filter((c) => c.id !== chapter.id),
        );

        await deleteMutation.mutateAsync({
          chapterId: chapter.id,
        });
        utils.chapter.byProjectId.invalidate({ projectId: project.id });
      }
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
                    color: chapter.title ? "white" : "gray",
                    variant: "body2",
                  }}
                  disabled={!canEdit}
                  value={chapter.title}
                  placeholder={t("project.chapters.item.placeholder.title")}
                  onSave={(e) => handleEdit("title", e)}
                  textFieldProps={{
                    sx: { color: "white" },
                  }}
                />
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <EditableText
                  textProps={{
                    color: chapter.title ? "white" : "gray",
                    variant: "body2",
                  }}
                  disabled={!canEdit}
                  value={chapter.description}
                  onSave={(e) => handleEdit("description", e)}
                  textFieldProps={{
                    multiline: true,
                    sx: { color: "white" },
                  }}
                  placeholder={t(
                    "project.chapters.item.placeholder.description",
                  )}
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
