import * as React from "react";
import { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";

type Props = {
  children: JSX.Element;
} & RouteComponentProps<any>;

const ResetScroll: React.FC<Props> = ({ children, location }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return children;
};

export default withRouter(ResetScroll);
