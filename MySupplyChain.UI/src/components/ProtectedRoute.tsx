import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
