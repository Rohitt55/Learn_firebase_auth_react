import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/admin-login" replace />;
  if (role !== "admin") return <Navigate to="/admin-login" replace />;

  return children;
};

export default AdminRoute;
