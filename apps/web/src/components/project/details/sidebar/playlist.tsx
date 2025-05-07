import {
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import Image from "mui-image";
import { useTranslations } from "next-intl";

import type { ProjectById } from "@/lib/trpc/types";
import { useRouter } from "next/navigation";

export const Playlist: React.FC<{ project: ProjectById }> = ({ project }) => {
  const router = useRouter();
  const t = useTranslations();

  const handleClick = (id: string) => {
    router.push(`/project/${id}`);
  };

  if (!project.playlist) return null;

  return (
    <Card>
      <CardContent sx={{ paddingY: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("project.playlist")}
        </Typography>

        <List
          dense={true}
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            bgcolor: "neutral.100",
            position: "relative",
            overflow: "auto",
            borderRadius: 2,
            "& ul": { padding: 0 },
          }}
        >
          {project.playlist.projects?.map((p) => (
            <ListItem key={p.id}>
              <ButtonBase
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 1,
                  borderColor: project.id === p.id ? "black" : "secondary.main",
                  borderWidth: 2,
                  borderStyle: "solid",
                }}
                onClick={() => handleClick(p.id)}
              >
                <Stack
                  sx={[{ backgroundColor: "black" }]}
                  width={150}
                  height={100}
                >
                  <Image
                    src={p.thumbnailURL}
                    showLoading={<CircularProgress />}
                    bgColor="#000000"
                  />

                  <Stack flex={1} marginX={1} paddingBottom={3}>
                    <Typography
                      variant="caption"
                      color={"white"}
                      sx={{
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 1,
                      }}
                    >
                      {p.title}
                    </Typography>
                  </Stack>
                </Stack>
              </ButtonBase>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
