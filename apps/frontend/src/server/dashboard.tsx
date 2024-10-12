import React from "react";
import { useEffect } from "react";

// just some regular React component
const DashboardComponent = () => {
  useEffect(() => {
    window.location.href = "/admin/resources/Project";
  }, []);

  return <div>Redirecting...</div>;
};

export default DashboardComponent;
