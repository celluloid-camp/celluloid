import { NotificationsTrigger } from "@celluloid/notifications/components/trigger";
import { Box, IconButton, Menu, MenuItem, Skeleton } from "@mui/material";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useState } from "react";
import { signOut, type User, useSession } from "@/lib/auth-client";
import { Avatar } from "./avatar";

export const Notifications = () => {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering on client
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const { data: session, isPending } = useSession();
  const t = useTranslations();

  if (!mounted || isPending) {
    return null;
  }

  if (!session?.user) {
    return null;
  }
  return (
    <Box marginX={1}>
      <NotificationsTrigger />
    </Box>
  );
};
