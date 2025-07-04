import { Box, Container } from "@mui/material";
import { UserProfile } from "@/components/profile/user-profile";

export default function ProfilePage() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        bgcolor: "brand.orange",
        pt: 8,
      }}
    >
      <Container>
        <UserProfile />
      </Container>
    </Box>
  );
}
