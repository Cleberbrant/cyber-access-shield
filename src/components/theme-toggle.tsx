
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "dark"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setThemeState(theme === "light" ? "dark" : "light");
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      className="relative overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
    >
      <Sun className={`h-5 w-5 rotate-0 scale-100 transition-all ${theme === "dark" ? "rotate-90 scale-0" : ""}`} />
      <Moon className={`absolute h-5 w-5 rotate-90 scale-0 transition-all ${theme === "dark" ? "rotate-0 scale-100" : ""}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
