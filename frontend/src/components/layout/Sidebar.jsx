import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import { useAuth } from "../../context/AuthContext"
import { FaHome, FaHistory, FaCog, FaChartBar, FaSignOutAlt } from "react-icons/fa"

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: FaHome },
  { name: "History", href: "/history", icon: FaHistory },
  // { name: "Pricing", href: "/pricing", icon: FaChartBar },
  { name: "Settings", href: "/settings", icon: FaCog },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="bg-primary text-primary-foreground p-1 rounded">AI</span>
          Summarizer
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="text-lg" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{user?.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
