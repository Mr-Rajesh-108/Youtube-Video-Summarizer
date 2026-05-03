import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { FaBars, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa"
import { FiMoon, FiSun } from "react-icons/fi"

// ── Simple theme hook (persists to localStorage + syncs <html> class) ────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  return { theme, toggle }
}

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate("/login")
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">

        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="mr-4 md:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          <FaBars />
        </button>

        <div className="flex w-full items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* intentionally empty — breadcrumbs / page title can go here */}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            </button>

            {/* User avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                title="Account"
                className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/20 text-primary font-bold text-sm hover:bg-primary/30 transition-colors ring-2 ring-transparent hover:ring-primary/40"
              >
                {initials}
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                  </div>

                  {/* Settings link */}
                  <button
                    onClick={() => { setDropdownOpen(false); navigate("/settings") }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FaCog className="text-muted-foreground" />
                    Settings
                  </button>

                  {/* Profile link */}
                  <button
                    onClick={() => { setDropdownOpen(false); navigate("/settings") }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FaUser className="text-muted-foreground" />
                    My Profile
                  </button>

                  <div className="border-t border-border mt-1" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <FaSignOutAlt />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}
