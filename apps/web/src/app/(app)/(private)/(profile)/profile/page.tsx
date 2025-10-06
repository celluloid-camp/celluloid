import { Box, Container } from "@mui/material";
import { UserProfile } from "@/components/profile/user-profile";

export default function ProfilePage() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        height: "100%",
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
