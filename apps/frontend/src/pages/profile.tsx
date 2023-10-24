import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";

import { MyProjectGrid } from "~components/profile/MyProjectGrid";
import { UserAvatar } from "~components/UserAvatar";
import { trpc } from "~utils/trpc";

const UserProfile: React.FC = () => {
  const { data, isFetching } = trpc.user.me.useQuery();
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "brand.orange",
        pt: 8,
      }}
    >
      <Container>
        {isFetching || !data ? (
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
            <Stack alignItems={"center"}>
              <UserAvatar username={data.username} userId={data.id} />
              <Typography variant="h4" color="textPrimary" sx={{ mt: 1 }}>
                {data.username}
              </Typography>
              <Typography variant="body1" color="textPrimary" sx={{ mt: 1 }}>
                {data.email} - {data.role}
              </Typography>
            </Stack>

            <MyProjectGrid />
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
      </Container>
    </Box>
  );
};

export default UserProfile;
