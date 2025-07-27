import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
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
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  User as UserIcon,
  Home,
  Building,
  DollarSign,
  FileText,
  Bell,
  BarChart3,
  MessageSquare,
  Wallet,
  CreditCard,
  Users,
} from "lucide-react";

// Custom Components
import { UserAvatar } from "@/components/custom/UserAvatar";
import { ProfileForm } from "@/components/custom/ProfileForm";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Member-specific navigation items (simplified)
const memberNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/my-groups", label: "My Groups", icon: Building },
  { to: "/my-loans", label: "My Loans", icon: CreditCard },
  { to: "/my-savings", label: "My Savings", icon: Wallet },
  { to: "/my-transactions", label: "Transactions", icon: DollarSign },
  { to: "/meetings", label: "Meetings", icon: Bell },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export default function MemberLayout() {
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
      <div className="flex h-screen w-screen bg-background">
        <Sidebar>
          <SidebarContent>
            <div className="h-16 flex items-center justify-center font-bold text-lg border-b">
              <UserIcon className="h-6 w-6 mr-2 text-primary" />
              Member Portal
            </div>
            <SidebarMenu>
              {memberNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith(item.to)}
                    >
                      <Link to={item.to} className="w-full flex items-center">
                        <IconComponent className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              &copy; {new Date().getFullYear()} Microfinance MIS
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <h1 className="text-lg font-semibold">Member Dashboard</h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                {user && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full"
                        >
                          <UserAvatar user={user} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                      >
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              <UserIcon className="h-3 w-3 inline mr-1" />
                              Member
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setProfileDialogOpen(true)}
                        >
                          <UserIcon className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile Dialog */}
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
                          isAdmin={false}
                        />
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 w-full overflow-y-auto">
            <div className="w-full p-8 space-y-8 h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
