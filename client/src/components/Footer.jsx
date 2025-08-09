import React from "react";

const Footer = () => {
  return (
    <footer className="border-t bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                M
              </span>
            </div>
            <span className="font-semibold">Microfinance</span>
          </div>

          <div className="text-sm text-muted-foreground">
            © 2024 Microfinance Platform. Empowering communities through financial inclusion.
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
