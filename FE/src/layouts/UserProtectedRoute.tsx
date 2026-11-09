import React from "react";
import { Navigate } from "react-router-dom";
import useCustomerStore from "../stores/customerStore";

const UserProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, user } = useCustomerStore();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // Admin cannot access customer pages
  if (user && (user.role === 0 || user.role === "admin")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserProtectedRoute;
