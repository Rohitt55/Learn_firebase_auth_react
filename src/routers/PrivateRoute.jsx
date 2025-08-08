import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, currentUser, loading } = useAuth();
  const isAuthed = user ?? currentUser;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div
          className="inline-block w-8 h-8 text-gray-700 border-4 border-current border-solid rounded-full animate-spin border-e-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
