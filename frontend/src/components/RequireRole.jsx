import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

export default function RequireRole({ allow = [], role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;

  const allowed = (role ? [role, ...allow] : allow).map(normalize);
  const current = normalize(user.role ?? user.peran);
  if (!allowed.includes(current)) return <Navigate to="/" replace />;

  return children ?? <Outlet />;
}