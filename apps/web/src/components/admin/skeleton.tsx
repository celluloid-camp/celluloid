import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export function UserTableSkeleton() {
  return (
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
          {[1, 2, 3, 4].map((item) => (
            <TableRow key={item}>
              <TableCell>
                <Skeleton variant="text" width="80%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="90%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="60%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="40%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="circular" width={24} height={24} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ProjectTableSkeleton() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Share Code</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Published At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4].map((item) => (
            <TableRow key={item}>
              <TableCell>
                <Skeleton variant="text" width="80%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="90%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="60%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="40%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="circular" width={24} height={24} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
