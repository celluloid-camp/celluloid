import { Box, Skeleton } from "@mui/material";
import type * as React from "react";
import type { User } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";
import type { ProjectById } from "@/lib/trpc/types";
import { ExportPanel } from "./sidebar/export-panel";
import { Members } from "./sidebar/members";
import { Playlist } from "./sidebar/playlist";
import { Share } from "./sidebar/share";

interface SideBarProps {
  project: ProjectById;
}

export const SideBar: React.FC<SideBarProps> = ({ project }) => {
  const { data: session, isPending } = useSession();
  if (isPending) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            borderRadius: 2,
            width: "100%",
            height: 200,
            paddingY: 2,
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            borderRadius: 2,
            width: "100%",
            height: 100,
            paddingY: 2,
          }}
        />
      </Box>
    );
  }
  return (
    <Box>
      <Playlist project={project} />
      {session ? (
        <Box>
          <Share project={project} user={session.user} />
          <Members project={project} user={session.user} />
          <ExportPanel project={project} />
        </Box>
      ) : null}
    </Box>
  );
};
