import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Handshake,
  PiggyBank,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";
import { logout } from "@/store/slices/authSlice";
import { toggleSidebar, openModal } from "@/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials, getRoleDisplayName } from "@/utils/userUtils";
import { getClassName } from "@/utils/uiUtils";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { sidebar, notifications } = useSelector((state) => state.ui);
  const { unreadCount } = useSelector((state) => state.notification);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/admin/dashboard",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: location.pathname.startsWith("/admin/users"),
    },
    {
      name: "Loans",
      href: "/admin/loans",
      icon: Handshake,
      current: location.pathname.startsWith("/admin/loans"),
    },
    {
      name: "Savings",
      href: "/admin/savings",
      icon: PiggyBank,
      current: location.pathname.startsWith("/admin/savings"),
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
      current: location.pathname.startsWith("/admin/reports"),
    },
    {
      name: "Meetings",
      href: "/admin/meetings",
      icon: Calendar,
      current: location.pathname.startsWith("/admin/meetings"),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname.startsWith("/admin/settings"),
    },
  ];

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebar.isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <div
        className={getClassName(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebar.isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MF</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Microfinance MIS
              </span>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSidebar())}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={getClassName(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.current
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(toggleSidebar())}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => item.current)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => dispatch(openModal("notifications"))}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
