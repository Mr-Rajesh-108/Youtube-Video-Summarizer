import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiSun, FiMoon } from "react-icons/fi"

export function PublicNavbar() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 h-16 bg-background/70 backdrop-blur-xl border-b border-border/50">
      {/* Left — Logo + nav links */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span
            className="text-primary-foreground px-2 py-0.5 rounded-md text-sm"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
          >
            AI
          </span>
          <span className="text-foreground">Summarizer</span>
        </Link>

        <div className="hidden md:flex gap-1">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-200 h-10 flex items-center px-3 rounded-lg text-sm font-medium"
          >
            Features
          </a>
          <Link
            to="/pricing"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-200 h-10 flex items-center px-3 rounded-lg text-sm font-medium"
          >
            Pricing
          </Link>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-200 h-10 flex items-center px-3 rounded-lg text-sm font-medium"
          >
            How it Works
          </a>
        </div>
      </div>

      {/* Right — theme toggle + auth links */}
      <div className="flex items-center gap-2">
        {/* Light / Dark toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-200"
        >
          {dark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>

        <Link
          to="/login"
          className="hidden sm:block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/40"
        >
          Log In
        </Link>

        <Link
          to="/signup"
          className="px-5 py-2 text-primary-foreground rounded-full text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}
