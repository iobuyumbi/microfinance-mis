import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Groups", href: "/groups", icon: "group" },
    { label: "Loans", href: "/loans", icon: "payments" },
    { label: "Meetings", href: "/meetings", icon: "event" },
    { label: "Reports", href: "/reports", icon: "assessment" },
    { label: "Savings", href: "/savings", icon: "savings" },
    { label: "Transactions", href: "/transactions", icon: "receipt_long" },
    { label: "Accounts", href: "/accounts", icon: "account_balance" },
  ];

  // Add admin-only links
  if (user?.role === "admin") {
    sidebarLinks.push(
      { label: "Users", href: "/users", icon: "people" },
      { label: "Settings", href: "/settings", icon: "settings" }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 min-h-[calc(100vh-4rem)] flex-col border-r">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <span className="material-icons text-xl">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="ml-2 mt-2">
              <span className="material-icons">menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {sidebarLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="material-icons text-xl">{link.icon}</span>
                  {link.label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
