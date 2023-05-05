import { Avatar, AvatarProps } from "@mui/material";
import React from "react";

import { getUserColor, getUserInitials } from "~utils/UserUtils";

type UserAvatarProps = AvatarProps & {
  username: string;
  userId: string;
  small?: boolean;
};

export const UserAvatar: React.FC<UserAvatarProps> = React.memo(
  ({ userId, username, small, ...props }) => (
    <Avatar
      sx={
        small
          ? {
              height: 24,
              width: 24,
              backgroundColor: getUserColor(userId),
              ...props.sx,
            }
          : {
              height: 40,
              width: 40,
              backgroundColor: getUserColor(userId),
              ...props.sx,
            }
      }
      {...props}
    >
      {getUserInitials(username)}
    </Avatar>
  )
);
