"use client";
import {
  Box,
  Container,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Avatar } from "@/components/common/avatar";
import { useLocaleRole } from "@/i18n/roles";
import { trpc } from "@/lib/trpc/client";

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

function ProfileHeader() {
  const localeRole = useLocaleRole();
  const [data] = trpc.user.me.useSuspenseQuery();

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
          {data.email}
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
    </>
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();

  // Determine active tab based on pathname
  const getTabValue = () => {
    if (pathname?.includes("/myPlaylists")) return 1;
    return 0; // default to myproject
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      router.push("/profile/myproject");
    } else if (newValue === 1) {
      router.push("/profile/myPlaylists");
    }
  };

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
      <Box sx={{ padding: 5 }}>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileHeader />
        </Suspense>

        <Container maxWidth="lg">
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, mt: 5 }}>
            <Tabs
              value={getTabValue()}
              onChange={handleTabChange}
              aria-label="Profile tabs"
            >
              <Tab
                label={t("home.myProjects")}
                sx={{
                  fontSize: 20,
                  fontFamily: "abril_fatfaceregular",
                  fontWeight: 600,
                }}
              />
              <Tab
                label={t("home.myPlaylists")}
                sx={{
                  fontSize: 20,
                  fontFamily: "abril_fatfaceregular",
                  fontWeight: 600,
                }}
              />
            </Tabs>
          </Box>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
