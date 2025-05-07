import { authClient } from "@/lib/auth-client";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserWithRole } from "better-auth/plugins/admin";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { UserTableSkeleton } from "./skeleton";
interface UserAdditionalField extends UserWithRole {
  username: string;
}
export default function UsersPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const confirm = useConfirm();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const usersList = await authClient.admin.listUsers({
        query: {
          limit: 10,
        },
      });
      return (usersList.data?.users as UserAdditionalField[]) ?? [];
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authClient.admin.removeUser({ userId }),
    onSuccess: () => {
      enqueueSnackbar(t("admin.users.delete.success"), {
        variant: "success",
        key: "admin.users.delete.success",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      enqueueSnackbar(t("admin.users.delete.error"), {
        variant: "error",
        key: "admin.users.delete.error",
      });
    },
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const value = await confirm({
        title: t("admin.users.dialog.title"),
        description: t("admin.users.dialog.description"),
      });

      if (!value.confirmed) {
        handleMenuClose();
        return;
      }

      await deleteUserMutation.mutateAsync(selectedUser);
      handleMenuClose();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleModifyUser = () => {
    router.push(`/admin/user/${selectedUser}`);
    handleMenuClose();
  };
  return (
    <Box>
      <Typography variant="h6" marginBottom={2}>
        {t("admin.users.title")}
      </Typography>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("users.table.username")}</TableCell>
                <TableCell>{t("users.table.email")}</TableCell>
                <TableCell>{t("users.table.role")}</TableCell>
                <TableCell>{t("users.table.createAt")}</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, user.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleModifyUser}>
          <EditIcon sx={{ mr: 1 }} />
          {t("admin.table.actions.modify")}
        </MenuItem>
        <MenuItem onClick={handleDeleteUser} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t("admin.table.actions.delete")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
