import { Box, Paper, Typography } from "@mui/material";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export default function LegalNoticePage() {
  return (
    <Box sx={{ backgroundColor: "brand.orange" }}>
      <Box
        sx={{
          paddingTop: 10,
          margin: "0 auto",
        }}
      >
        <Box sx={{ margin: "0 auto" }}>
          <ApiReferenceReact
            configuration={{
              showSidebar: false,
              hideModels: true,
              defaultOpenAllTags: false,
              hideDarkModeToggle: true,
              hideSearch: true,
              darkMode: false,
              authentication: {
                cookieAuth: {
                  name: "celluloid_session",
                  type: "cookie",
                },
              },
              layout: "classic",
              sources: [
                {
                  url: "/api/openapi.json",
                },
              ],
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
