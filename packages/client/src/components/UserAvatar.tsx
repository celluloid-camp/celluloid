import { UserRecord } from "@celluloid/types";
import { Avatar } from "@mui/material";
import * as React from "react";
import { getUserColor, getUserInitials } from "utils/UserUtils";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     small: {
// height: spacing.unit * 4,
// width: spacing.unit * 4,
// fontSize: "13px",
//     },
//   });

interface Props {
  user: UserRecord;
  noMargin?: boolean;
  small?: boolean;
}

export default ({ user, noMargin, small }: Props) => (
  <Avatar
    // sx={(theme)=> small? {
    //   height: theme.spacing * 4,
    //   width: theme.spacing * 4
    // }: undefined}
    style={{
      margin: noMargin ? 0 : small ? 4 : 10,
      backgroundColor: getUserColor(user),
    }}
  >
    {getUserInitials(user)}
  </Avatar>
);
