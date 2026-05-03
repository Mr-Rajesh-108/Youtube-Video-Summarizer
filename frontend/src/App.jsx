import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/layout/Layout"
import { LandingPage } from "./pages/LandingPage"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { VerifyEmail } from "./pages/VerifyEmail"
import { Dashboard } from "./pages/Dashboard"
import { VideoSummary } from "./pages/VideoSummary"
import { History } from "./pages/History"
import { Settings } from "./pages/Settings"
import { Pricing } from "./pages/Pricing"
import { useAuth } from "./context/AuthContext"
import { Loader } from "./components/ui/Loader"
import "./index.css"

/** Requires the user to be authenticated — redirects to /login otherwise */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/** Redirects already-logged-in users away from auth pages */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Auth Routes — redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

        {/* Protected App Routes with Layout (Sidebar, Navbar) */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/summary/new" element={<VideoSummary />} />
          <Route path="/summary/:id" element={<VideoSummary />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
