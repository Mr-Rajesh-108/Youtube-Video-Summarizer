import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
