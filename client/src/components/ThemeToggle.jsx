import React from "react";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const [dark, setDark] = React.useState(
    () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      localStorage.getItem("theme") === "dark"
  );

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? (
        <span className="material-icons">dark_mode</span>
      ) : (
        <span className="material-icons">light_mode</span>
      )}
    </Button>
  );
}
