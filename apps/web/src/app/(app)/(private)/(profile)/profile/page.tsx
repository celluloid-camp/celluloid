import { UserProfile } from "@/components/profile/user-profile";
import { Container, Box } from "@mui/material";

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
