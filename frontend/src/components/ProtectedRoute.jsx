import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("qc_user") || "null");
    } catch {
      return null;
    }
  })();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
