import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore.js";

/**
 * ProtectedRoute
 * Redirects to /login if not authenticated.
 * Optionally accepts an allowedRoles array to enforce role-based access.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, isInitialized } = useAuthStore();

  // Still initializing auth (validating token with server)
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="spinner h-8 w-8" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
