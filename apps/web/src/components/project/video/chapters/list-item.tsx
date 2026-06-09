import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Grow,
  IconButton,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useState } from "react";
import type { User } from "@/lib/auth-client";
import type { ChapterByProjectId, ProjectById, UserMe } from "@/lib/trpc/types";

interface ChapterItemProps {
  canEdit: boolean;
  chapter: ChapterByProjectId;
  index: number;
  onEditChapter?: (chapter: ChapterByProjectId) => void;
  onDeleteChapter?: (chapter: ChapterByProjectId) => void;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  canEdit,
  index,
  onEditChapter,
  onDeleteChapter,
}) => {
  const t = useTranslations();
  const [hovering, setHovering] = useState(false);

  const confirm = useConfirm();

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
        onDeleteChapter?.(chapter);
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
              <Typography
                variant="body2"
                className={chapter.title ? "text-white" : "text-neutral-400"}
              >
                {chapter.title || t("project.chapters.item.placeholder.title")}
              </Typography>
            }
            secondary={
              chapter.description ? (
                <Typography
                  variant="body2"
                  className={
                    chapter.description ? "text-white" : "text-neutral-400"
                  }
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                  }}
                >
                  {chapter.description}
                </Typography>
              ) : null
            }
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              alignContent: "center",
              justifyContent: "center",
              minWidth: 40,
            }}
          >
            {hovering && canEdit ? (
              <Stack direction={"row"}>
                <Tooltip title="Supprimer" arrow>
                  <IconButton onClick={handleDelete}>
                    <DeleteIcon className="text-white/50 size-4" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit" arrow>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditChapter?.(chapter);
                    }}
                  >
                    <EditIcon className="text-white/50 size-4" />
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
