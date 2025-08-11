import React from "react";
import { Navigate } from "react-router-dom";

const OwnerAdminRoute = ({ children }) => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("qc_user") || "null");
    } catch {
      return null;
    }
  })();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "owner" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OwnerAdminRoute;
