import { Avatar, AvatarProps } from "@mui/material";
import React from "react";

import { getUserColor, getUserInitials } from "~utils/UserUtils";

type UserAvatarProps = AvatarProps & {
  username: string;
  userId: string;
  small?: boolean;
};

export const UserAvatar: React.FC<UserAvatarProps> = React.memo(
  ({ userId, username, small }) => (
    <Avatar
      sx={
        small
          ? {
              height: 24,
              width: 24,
              backgroundColor: getUserColor(userId),
            }
          : {
              height: 40,
              width: 40,
              backgroundColor: getUserColor(userId),
            }
      }
    >
      {getUserInitials(username)}
    </Avatar>
  )
);
