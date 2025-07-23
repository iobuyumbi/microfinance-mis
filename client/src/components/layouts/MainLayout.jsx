
// src/components/MainLayout.jsx
import React, { useState } from 'react'; // React is implicitly imported by JSX, but good practice to include for clarity with hooks
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Assuming this path is correct

// Shadcn UI Imports
import { Button } from '../../components/ui/button'; // Path assumes you've run `shadcn-ui add button`
import { UserAvatar } from '@/components/custom/UserAvatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ProfileForm } from '@/components/custom/ProfileForm';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger, // <-- Add this import
} from '@/components/ui/sidebar';

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
      toast.success('Profile updated successfully.');
      setProfileDialogOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
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
        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="h-16 border-b flex items-center px-6 justify-between bg-background">
            <div className="flex items-center gap-2">
              {/* Hamburger icon for mobile */}
              <span className="md:hidden">
                <SidebarTrigger />
              </span>
              <span className="font-semibold text-lg">
                {navItems.find((i) => location.pathname.startsWith(i.to))?.label ||
                  "Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme toggle next to avatar */}
              <div className="flex items-center gap-2">
                <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme('light')} aria-label="Light theme">
                  <Sun className="h-5 w-5" />
                </Button>
                <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme('dark')} aria-label="Dark theme">
                  <Moon className="h-5 w-5" />
                </Button>
                <Button variant={theme === 'system' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme('system')} aria-label="System theme">
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
                      <DropdownMenuLabel className="flex flex-col items-center">
                        <UserAvatar user={user} size="lg" />
                        <span className="mt-2 font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                        <UserIcon className="mr-2 h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <ProfileForm
                        initialValues={user}
                        onSubmit={handleProfileSave}
                        onCancel={() => setProfileDialogOpen(false)}
                        loading={profileLoading}
                        isAdmin={user.role === 'admin'}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 w-full overflow-y-auto">
            <div className="container mx-auto p-8 space-y-8 min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
    
  );
}