import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserWithRole } from "better-auth/plugins/admin";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { SearchFilter } from "./search-filter";
import { UserTableSkeleton } from "./skeleton";

interface UserAdditionalField extends UserWithRole {
  username: string;
}

function getUserInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export default function UsersPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const confirm = useConfirm();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", page, rowsPerPage, searchTerm],
    queryFn: async () => {
      const usersList = await authClient.admin.listUsers({
        query: {
          searchField: "email",
          searchValue: searchTerm,
          searchOperator: "contains",
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        },
      });
      return {
        users: usersList.data?.users as UserAdditionalField[],
        total: usersList.data?.total ?? 0,
      };
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const users = usersData?.users ?? [];

  return (
    <Box className="flex flex-col gap-6">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Box>
          <Box className="flex items-center gap-2">
            <Typography
              variant="h6"
              className="font-semibold tracking-tight text-slate-900"
            >
              {t("admin.users.title")}
            </Typography>
            {!isLoading && usersData !== undefined && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {usersData.total}
              </span>
            )}
          </Box>
        </Box>

        <Box className="w-full sm:max-w-sm">
          <SearchFilter
            onFilterChange={setSearchTerm}
            placeholder={t("admin.users.search.placeholder")}
          />
        </Box>
      </Box>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <Paper
          elevation={0}
          className="overflow-hidden rounded-xl border border-black/5 shadow-sm"
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-slate-50/90">
                  <TableCell className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {t("users.table.username")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {t("users.table.email")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {t("users.table.emailVerified")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {t("users.table.role")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {t("users.table.createAt")}
                  </TableCell>
                  <TableCell
                    align="right"
                    className="text-xs font-semibold tracking-wide text-slate-500 uppercase"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="border-none py-16">
                      <Box className="flex flex-col items-center gap-3 text-center">
                        <Box className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <PeopleAltRoundedIcon />
                        </Box>
                        <Typography
                          variant="body1"
                          className="font-medium text-slate-700"
                        >
                          {t("admin.list.empty")}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {getUserInitials(user.username || "?")}
                          </Box>
                          <span className="font-medium text-slate-900">
                            {user.username}
                          </span>
                        </Box>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.emailVerified
                              ? t("common.verified")
                              : t("common.unverified")
                          }
                          size="small"
                          className={
                            user.emailVerified
                              ? "border border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                              : "border border-slate-200 bg-slate-100 font-medium text-slate-600"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            user.role === "admin"
                              ? "inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize"
                              : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize"
                          }
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user.id)}
                          className="text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {users.length > 0 && (
            <Box className="border-t border-black/5">
              <TablePagination
                component="div"
                count={usersData?.total ?? 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage={t("common.table.rowsPerPage")}
                className="text-slate-600"
              />
            </Box>
          )}
        </Paper>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            className:
              "mt-1 min-w-[160px] rounded-xl border border-black/5 shadow-lg",
          },
        }}
      >
        <MenuItem onClick={handleModifyUser} className="gap-2 py-2">
          <EditIcon fontSize="small" className="text-slate-500" />
          {t("admin.table.actions.modify")}
        </MenuItem>
        <MenuItem
          onClick={handleDeleteUser}
          className="gap-2 py-2 text-(--color-error)"
        >
          <DeleteIcon fontSize="small" />
          {t("admin.table.actions.delete")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
