"use client";
import { Box, Container, Skeleton, Stack, Typography } from "@mui/material";
import type * as React from "react";
import { Suspense } from "react";

import { Avatar } from "@/components/common/avatar";
import { useLocaleRole } from "@/i18n/roles";
import { trpc } from "@/lib/trpc/client";
import { UserPublicProjects } from "./projects";

function ProfileSkeleton() {
  return (
    <Stack alignItems="center" spacing={2}>
      <Skeleton variant="circular" width={100} height={100} />
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="text" width={250} height={24} />
      <Skeleton variant="text" width={150} height={24} />
      <Skeleton variant="text" width={300} height={60} />
    </Stack>
  );
}

function PublicProfileContent({ userId }: { userId: string }) {
  const localeRole = useLocaleRole();
  const [data] = trpc.user.publicById.useSuspenseQuery({ id: userId });

  if (!data) return null;
  return (
    <>
      <Stack alignItems="center">
        <Avatar
          sx={{
            background: data.color,
            width: 100,
            height: 100,
            borderWidth: 2,
            borderColor: data.color,
            borderStyle: "solid",
            fontSize: 30,
          }}
          src={data.avatar?.publicUrl}
        >
          {data.initial}
        </Avatar>

        <Typography
          variant="h4"
          color="textPrimary"
          sx={{ mt: 1 }}
          data-testid="profile-header-title"
        >
          {data.username}
        </Typography>
        <Typography variant="body1" color="textPrimary" sx={{ mt: 1 }}>
          {localeRole(data.role)}
        </Typography>
      </Stack>
      <Stack alignItems="center">
        <Typography variant="body2" color="textPrimary">
          {data.bio}
        </Typography>
      </Stack>

      <UserPublicProjects userId={userId} />
    </>
  );
}

export function PublicUserProfile({ userId }: { userId: string }) {
  const { data } = trpc.user.byId.useQuery({ id: userId });

  if (!data) return null;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PublicProfileContent userId={userId} />
    </Suspense>
  );
}
