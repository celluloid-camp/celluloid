import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Box } from "@mui/material";

export default function Layout({
  modal,
  children,
}: {
  modal: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {modal}
      <Header />
      <Box sx={{ flexGrow: 1, pt: 8 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
