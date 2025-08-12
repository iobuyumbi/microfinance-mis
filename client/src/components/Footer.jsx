import React from "react";

const Footer = () => {
  return (
    <footer className="border-t bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-row justify-between items-center h-10">
          <div className="text-xs text-muted-foreground">
            © 2024 Microfinance Platform
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
