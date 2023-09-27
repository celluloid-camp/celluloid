import * as React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";


const ResetScroll: React.FC<any> = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export default ResetScroll;
