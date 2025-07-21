import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/members", label: "Members" },
  { to: "/loans", label: "Loans" },
  { to: "/savings", label: "Savings" },
  { to: "/transactions", label: "Transactions" },
  { to: "/reports", label: "Reports" },
  { to: "/notifications", label: "Notifications" },
  { to: "/settings", label: "Settings" },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-muted border-r flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-lg border-b">
          Microfinance MIS
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`block px-6 py-2 rounded transition-colors hover:bg-accent hover:text-accent-foreground font-medium ${
                    location.pathname.startsWith(item.to)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 text-xs text-muted-foreground text-center border-t">
          &copy; {new Date().getFullYear()} Microfinance MIS
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b flex items-center px-6 justify-between bg-background">
          <div className="font-semibold text-lg">
            {navItems.find((i) => location.pathname.startsWith(i.to))?.label ||
              "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground px-3 py-1 rounded font-semibold hover:bg-destructive/90 transition text-sm"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
