import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminClient } from "better-auth/client/plugins";
import type { UserWithRole } from "better-auth/plugins/admin";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
export default function UsersPanel() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const confirm = useConfirm();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const t = useTranslations();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await authClient.admin.listUsers({
          query: {
            limit: 10,
          },
        });
        setUsers(usersList.data?.users ?? []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string
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
        title: "Delete User",
        description: "Are you sure you want to delete this user?",
      });

      if (!value.confirmed) return;

      await authClient.admin.removeUser({
        userId: selectedUser,
      });

      setUsers(users.filter((user) => user.id !== selectedUser));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
    handleMenuClose();
  };

  const handleModifyUser = () => {
    console.log("Modify user:", selectedUser);
    handleMenuClose();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("admin.users.title")}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{user.role}</TableCell>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleModifyUser}>
          <EditIcon sx={{ mr: 1 }} />
          Modify
        </MenuItem>
        <MenuItem onClick={handleDeleteUser} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
