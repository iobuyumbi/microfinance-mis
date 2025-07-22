// src/components/MainLayout.jsx
import React from 'react'; // React is implicitly imported by JSX, but good practice to include for clarity with hooks
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Assuming this path is correct

// Shadcn UI Imports
import { Button } from '../../components/ui/button'; // Path assumes you've run `shadcn-ui add button`

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
  const { user, logout } = useAuth(); // Destructuring user and logout from AuthContext

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
                {/* Using Shadcn Button as a Link */}
                <Button
                  asChild // This prop tells Button to render as its child component (Link)
                  variant={location.pathname.startsWith(item.to) ? "secondary" : "ghost"} // Highlight active tab
                  className="w-full justify-start px-6" // Tailwind for full width and left alignment
                >
                  <Link to={item.to}>
                    {item.label}
                  </Link>
                </Button>
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
                {user.name || user.email} {/* Display user name or email */}
              </span>
            )}
            {/* Using Shadcn Button for Logout */}
            <Button
              variant="destructive" // Applies destructive styling
              onClick={handleLogout}
              size="sm" // Smaller size for header button
            >
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}