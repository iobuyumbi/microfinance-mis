import { Outlet } from "react-router-dom";
import { Card } from "../ui/card";
import ThemeToggle from "../ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with theme toggle */}
      <header className="w-full border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-bold text-lg tracking-tight">Microfinance MIS</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container flex items-center justify-center py-8">
        <Card className="w-full max-w-md p-6 space-y-6">
          <Outlet />
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Microfinance MIS. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
