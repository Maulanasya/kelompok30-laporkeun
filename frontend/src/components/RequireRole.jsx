import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function RequireRole({ allow = [], role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;

  const allowed = role ? [role, ...allow] : allow;
  if (!allowed.includes(user.role ?? user.peran)) return <Navigate to="/" replace />;

  return children ?? <Outlet />;
}