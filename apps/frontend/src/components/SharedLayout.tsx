import type * as React from "react";
import { Outlet } from "react-router-dom";

import { AppBarMenu } from "./AppBarMenu";

export const SharedLayout: React.FC = () => {
  return (
    <AppBarMenu>
      <Outlet />
    </AppBarMenu>
  );
};
