// src/components/MainLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Assuming this path is correct
import { useTheme } from "@/context/ThemeContext"; // Assuming this path is correct

// Shadcn UI Imports
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Lucide React Icons
import { Sun, Moon, Monitor, LogOut, User as UserIcon } from "lucide-react";

// Custom Components (assuming these paths are correct and components exist)
import { UserAvatar } from "@/components/custom/UserAvatar";
import { ProfileForm } from "@/components/custom/ProfileForm";
import { toast } from "sonner"; // Assuming sonner is configured
import { userService } from "@/services/userService"; // Assuming userService is configured
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"; // Assuming these custom sidebar components exist

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/groups", label: "Groups" },
  { to: "/meetings", label: "Meetings" },
  { to: "/chat", label: "Chat" },
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
  const { theme, setTheme } = useTheme();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileSave = async (data) => {
    setProfileLoading(true);
    try {
      await userService.update(user._id || user.id, data);
      toast.success("Profile updated successfully.");
      setProfileDialogOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <SidebarProvider>
      {/* The main container for the entire layout.
          'h-screen w-screen' ensures it always takes the full height and width of the viewport.
          'flex' enables flexbox for side-by-side layout of sidebar and main content. */}
      <div className="flex h-screen w-screen bg-background">
        {/* Sidebar component, assumed to have its own fixed width (e.g., w-64) internally. */}
        <Sidebar>
          <SidebarContent>
            <div className="h-16 flex items-center justify-center font-bold text-lg border-b">
              Microfinance MIS
            </div>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.to)}
                  >
                    <Link to={item.to} className="w-full">
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              &copy; {new Date().getFullYear()} Microfinance MIS
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area.
            'flex-1' makes it grow to fill remaining horizontal space.
            'flex flex-col' arranges header and main content vertically.
            'w-full' ensures it takes full width of its flex-1 container. */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="h-16 border-b flex items-center px-6 justify-between bg-background">
            <div className="flex items-center gap-2">
              {/* Hamburger icon for mobile */}
              <span className="md:hidden">
                <SidebarTrigger />
              </span>
              <span className="font-semibold text-lg">
                {navItems.find((i) => location.pathname.startsWith(i.to))
                  ?.label || "Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme toggle next to avatar */}
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === "light" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTheme("light")}
                  aria-label="Light theme"
                >
                  <Sun className="h-5 w-5" />
                </Button>
                <Button
                  variant={theme === "dark" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTheme("dark")}
                  aria-label="Dark theme"
                >
                  <Moon className="h-5 w-5" />
                </Button>
                <Button
                  variant={theme === "system" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTheme("system")}
                  aria-label="System theme"
                >
                  <Monitor className="h-5 w-5" />
                </Button>
              </div>
              {user && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span className="cursor-pointer">
                        <UserAvatar user={user} size="sm" />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="flex flex-col items-center p-4">
                        <UserAvatar user={user} size="lg" />
                        <span className="mt-2 font-semibold">
                          {user.name || user.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setProfileDialogOpen(true)}
                      >
                        <UserIcon className="mr-2 h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleLogout}
                        className="text-red-600 focus:text-red-800"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog
                    open={profileDialogOpen}
                    onOpenChange={setProfileDialogOpen}
                  >
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <ProfileForm
                        initialValues={user}
                        onSubmit={handleProfileSave}
                        onCancel={() => setProfileDialogOpen(false)}
                        loading={profileLoading}
                        isAdmin={user.role === "admin"}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </header>
          {/* Main content area. 'flex-1' makes it grow to fill remaining vertical space. */}
          <main className="flex-1 w-full overflow-y-auto">
            {/* FIX: Changed min-h-full to h-full to ensure content area always fills available height */}
            <div className="w-full p-8 space-y-8 h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
