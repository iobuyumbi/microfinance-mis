import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/groups", label: "Groups" },
    { href: "/loans", label: "Loans" },
    { href: "/meetings", label: "Meetings" },
    { href: "/savings", label: "Savings" },
    { href: "/transactions", label: "Transactions" },
    { href: "/accounts", label: "Accounts" },
    ...(user?.role === "admin"
      ? [
          { href: "/users", label: "Users" },
          { href: "/reports", label: "Reports" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" className="fixed left-4 top-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar items={navigationItems} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar items={navigationItems} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <Navbar />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
