import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../hooks/useTheme";

// Custom Components
import NotificationDropdown from "../components/custom/NotificationDropdown";

// Shadcn Components
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import Footer from "../components/Footer";

// Components
import LoadingSpinner from "../components/common/LoadingSpinner";

// Icons
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  PiggyBank,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  User,
  ChevronDown,
  MessageCircle,
  Home,
  Calendar,
  FileText,
  Moon,
  Sun,
  ArrowRightLeft,
} from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { notifications } = useSocket();
  const { theme, setTheme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Update unread notifications count
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unread = notifications.filter(
        (notification) => !notification.read
      ).length;
      setUnreadNotifications(unread);
    }
  }, [notifications]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  // Reset unread notifications when navigating to chat
  useEffect(() => {
    if (location.pathname === "/chat" && unreadNotifications > 0) {
      // In a real app, you would mark notifications as read in the backend
      setUnreadNotifications(0);
    }
  }, [location.pathname, unreadNotifications]);

  if (!user) {
    return <LoadingSpinner />;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["admin", "officer", "leader", "member"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Groups",
      href: "/groups",
      icon: Building2,
      roles: ["admin", "officer", "leader"],
    },
    {
      name: "Members",
      href: "/members",
      icon: Users,
      roles: ["admin", "officer", "leader"],
    },
    {
      name: "Loans",
      href: "/loans",
      icon: DollarSign,
      roles: ["admin", "officer", "leader", "member"],
    },
    {
      name: "Savings",
      href: "/savings",
      icon: PiggyBank,
      roles: ["admin", "officer", "leader", "member"],
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: CreditCard,
      roles: ["admin", "officer", "leader", "member"],
    },
    {
      name: "Contributions",
      href: "/contributions",
      icon: ArrowRightLeft,
      roles: ["admin", "officer", "leader", "member"],
    },
    {
      name: "Meetings",
      href: "/meetings",
      icon: Calendar,
      roles: ["admin", "officer", "leader"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["admin", "officer", "leader"],
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageCircle,
      roles: ["admin", "officer", "leader", "member"],
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex h-14 items-center border-b px-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    MF
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-bold">Microfinance</h1>
                  <p className="text-xs text-muted-foreground">
                    Management System
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-[calc(100vh-3.5rem)] justify-between">
              <ScrollArea className="flex-grow">
                <div className="px-2 py-4">
                  <div className="px-3 pb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full pl-8"
                      />
                    </div>
                  </div>
                  <nav className="flex flex-col space-y-1">
                    {filteredNavigation.map((item) => {
                      const isActive = location.pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground"
                          }`}
                          onClick={() => setIsMobileSidebarOpen(false)}
                        >
                          <div className="relative">
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.badge && (
                              <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </ScrollArea>

              {/* User Profile - Mobile Sidebar */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden border-r md:block md:w-64">
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  MF
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Microfinance</h1>
                <p className="text-xs text-muted-foreground">
                  Management System
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col h-[calc(100vh-3.5rem)] justify-between">
            <ScrollArea className="flex-grow">
              <div className="px-2 py-4">
                <div className="px-3 pb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full pl-8"
                    />
                  </div>
                </div>
                <nav className="flex flex-col space-y-1">
                  {filteredNavigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground"
                        }`}
                      >
                        <div className="relative">
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.badge && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </ScrollArea>

            {/* User Profile - Desktop Sidebar */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {filteredNavigation.find((item) =>
                    location.pathname.startsWith(item.href)
                  )?.name || "Dashboard"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <NotificationDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 pb-16">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-10 md:ml-64">
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
