import type { User } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface ProjectAnnotationsProps {
  projectId: string;
}

export function ProjectAnnotations({ projectId }: ProjectAnnotationsProps) {
  const t = useTranslations();
  const confirm = useConfirm();
  const utils = trpc.useUtils();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null,
  );

  const { data: annotations, isLoading } = trpc.annotation.byProjectId.useQuery(
    {
      id: projectId,
    },
  );

  const deleteAnnotation = trpc.annotation.delete.useMutation({
    onSuccess: () => {
      enqueueSnackbar(t("admin.project.annotations.success"), {
        variant: "success",
      });
      utils.annotation.byProjectId.invalidate({ id: projectId });
    },
    onError: () => {
      enqueueSnackbar(t("admin.project.annotations.error"), {
        variant: "error",
      });
    },
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    annotationId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedAnnotation(annotationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnnotation(null);
  };

  const handleDeleteAnnotation = async () => {
    if (!selectedAnnotation) return;

    try {
      const result = await confirm({
        title: t("admin.project.annotation.dialog.title"),
        description: t("admin.project.annotation.dialog.description"),
      });

      if (!result.confirmed) {
        handleMenuClose();
        return;
      }

      await deleteAnnotation.mutateAsync({
        annotationId: selectedAnnotation,
      });
      handleMenuClose();
    } catch (error) {
      console.error("Failed to delete annotation:", error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ pt: 2 }}>
        <Skeleton variant="rectangular" height={100} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        marginTop: 4,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" fontWeight="medium" marginBottom={2}>
        Annotations
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("admin.annotation.table.username")}</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>{t("admin.annotation.table.date")}</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {annotations && annotations.length > 0 ? (
              annotations.map((annotation) => (
                <TableRow key={annotation.id}>
                  <TableCell>
                    <Link href={`/admin/user/${annotation.user.id}`}>
                      {annotation.user.username}
                    </Link>
                  </TableCell>
                  <TableCell>{annotation.text}</TableCell>
                  <TableCell>{dayjs(annotation.createdAt).fromNow()}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, annotation.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t("admin.annotations.list.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteAnnotation} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t("admin.table.actions.delete")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
