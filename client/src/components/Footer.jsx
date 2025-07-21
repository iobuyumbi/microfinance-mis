import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-4 mt-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Microfinance MIS
        </span>
        <div className="flex gap-2">
          <Button asChild variant="link" size="sm">
            <Link to="/privacy">Privacy Policy</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/terms">Terms of Service</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <a
              href="https://github.com/your-org/microfinance-mis"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
