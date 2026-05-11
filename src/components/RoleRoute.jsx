import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowedRoles }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}