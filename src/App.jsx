import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contents from "./pages/Contents";
import Playlists from "./pages/Playlists";
import Screens from "./pages/Screens";
import PlaylistDetail from "./pages/PlaylistDetail";
import Users from "./pages/Users";
import RoleRoute from "./components/RoleRoute";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/contents"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "marketing", "viewer"]}>
              <Contents />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/playlists"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "marketing", "viewer"]}>
              <Playlists />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/screens"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "marketing"]}>
              <Screens />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <Users />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/playlists/:id"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "marketing", "viewer"]}>
              <PlaylistDetail />
            </RoleRoute>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
