import React from "react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "./ui/menubar";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Groups", to: "/groups" },
  { label: "Loans", to: "/loans" },
  { label: "Meetings", to: "/meetings" },
  { label: "Reports", to: "/reports" },
];

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="w-full border-b bg-background sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo / App Name */}
        <Link to="/" className="font-bold text-lg tracking-tight">
          Microfinance MIS
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-2 items-center">
          <Menubar className="bg-transparent border-none shadow-none">
            <MenubarMenu>
              <MenubarTrigger asChild>
                <Button variant="ghost">Menu</Button>
              </MenubarTrigger>
              <MenubarContent>
                {navLinks.map((link) => (
                  <MenubarItem asChild key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <ThemeToggle />
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <span className="material-icons">menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium"
                    onClick={() => document.activeElement.blur()}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/profile" className="text-lg font-medium mt-4">
                  Profile
                </Link>
                <button
                  className="text-left text-red-600 mt-2"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
