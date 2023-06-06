import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import * as React from "react";

import { UserAvatar } from "~components/UserAvatar";
import { useMe } from "~hooks/use-user";

const UserProfile: React.FC = () => {
  const { data, isLoading } = useMe();

  console.log(data);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "brand.orange",
        pt: 8,
      }}
    >
      {isLoading ? (
        <Box
          mx={2}
          my={10}
          display={"flex"}
          alignContent={"center"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Box>
            <CircularProgress />
          </Box>
        </Box>
      ) : (
        <>
          <UserAvatar username={data.username} userId={data.id} />
          <Typography variant="h4" color="textPrimary" sx={{ mt: 1 }}>
            {data.username}
          </Typography>
          <Typography variant="body1" color="textPrimary" sx={{ mt: 1 }}>
            {data.email} - {data.role}
          </Typography>

          {/* <Grid container spacing={2} sx={{ mt: 3 }}>
        {userProjects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textPrimary">
                  {project.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid> */}
        </>
      )}
    </Box>
  );
};

export default UserProfile;
