import { Box, Container } from "@mui/material";
import { PublicUserProfile } from "@/components/user/profile";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
        <PublicUserProfile userId={id} />
      </Container>
    </Box>
  );
}
