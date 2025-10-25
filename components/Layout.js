import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/history", label: "History" },
];

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f6] text-gray-800 transition-colors duration-300 ease-in-out dark:bg-[#0b0d10] dark:text-gray-200">
      <header className="sticky top-0 z-40 border-b border-brand-light/60 bg-white/80 shadow-soft backdrop-blur transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0b0d10]/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex items-center gap-2 text-base font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-brand dark:text-gray-100">
            <span className="text-lg font-display font-semibold tracking-tight">CELPIP Writing Practice ✍️</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring rounded-full px-3 py-1 text-gray-700 transition-colors duration-300 ease-in-out hover:bg-brand/10 hover:text-brand dark:text-gray-200 dark:hover:bg-brand/20"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://www.celpip.ca/"
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-full px-3 py-1 text-gray-700 transition-colors duration-300 ease-in-out hover:bg-brand/10 hover:text-brand dark:text-gray-200 dark:hover:bg-brand/20"
              >
                CELPIP
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="border-t border-brand-light/50 bg-white/60 px-4 py-6 text-center text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0b0d10]/70 dark:text-gray-400 sm:px-6 lg:px-8">
        © 2025 Creatures Inc. | Crafted by Preet Ojha | Next.js • TailwindCSS • Gemini
      </footer>
    </div>
  );
}
