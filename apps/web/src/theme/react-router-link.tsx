// import { ThemeOptions } from "@mui/material";
// import { LinkProps } from "@mui/material/Link";
// import * as React from "react";
// import {
//   Link as RouterLink,
//   LinkProps as RouterLinkProps,
// } from "react-router-dom";

// // eslint-disable-next-line react-refresh/only-export-components
// const LinkBehavior = React.forwardRef<
//   HTMLAnchorElement,
//   Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
// >((props, ref) => {
//   const { href, ...other } = props;
//   // Map href (Material UI) -> to (react-router)
//   return <RouterLink ref={ref} to={href} {...other} />;
// });

// export const reactRouterThemeOptions: ThemeOptions = {
//   components: {
//     MuiLink: {
//       defaultProps: {
//         component: LinkBehavior,
//       } as LinkProps,
//     },
//     MuiButtonBase: {
//       defaultProps: {
//         LinkComponent: LinkBehavior,
//       },
//     },
//   },
// };
