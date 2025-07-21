import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function Placeholder({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <h1 className="text-3xl font-bold mb-2">{label}</h1>
      <p className="text-lg">This page is under construction.</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={<Placeholder label="Dashboard" />}
            />
            <Route path="/members" element={<Placeholder label="Members" />} />
            <Route path="/loans" element={<Placeholder label="Loans" />} />
            <Route path="/savings" element={<Placeholder label="Savings" />} />
            <Route
              path="/transactions"
              element={<Placeholder label="Transactions" />}
            />
            <Route path="/reports" element={<Placeholder label="Reports" />} />
            <Route
              path="/notifications"
              element={<Placeholder label="Notifications" />}
            />
            <Route
              path="/settings"
              element={<Placeholder label="Settings" />}
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
