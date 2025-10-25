import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand/40 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-300 ease-in-out hover:border-brand hover:bg-brand hover:text-white dark:border-brand/30 dark:bg-[#14171d] dark:text-gray-200 dark:hover:bg-brand"
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} mode</span>
    </button>
  );
}

