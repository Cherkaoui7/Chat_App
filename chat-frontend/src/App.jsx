import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ChatDashboard from "./pages/ChatDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ScreenLoader() {
  return <div className="screen-loader">Loading...</div>;
}

function ProtectedRoute({ children }) {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <ScreenLoader />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <ScreenLoader />;
  }

  return isAuthenticated ? <Navigate to="/chat" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
