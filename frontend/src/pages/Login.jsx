import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { PublicNavbar } from "../components/layout/PublicNavbar"
import { login as apiLogin } from "../api/auth"
import { useAuth } from "../context/AuthContext"
import { FaYoutube, FaEye, FaEyeSlash } from "react-icons/fa"
import { FiAlertCircle } from "react-icons/fi"

export function Login() {
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError("Please fill in all fields.")
      return
    }
    setLoading(true)
    try {
      const data = await apiLogin(form)
      setAuthUser(data.user)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <PublicNavbar />

      <Card className="w-full max-w-md mt-16">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <span className="bg-primary text-primary-foreground p-2 rounded-lg">
              <FaYoutube className="text-2xl" />
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <FiAlertCircle className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
              <Input
                id="email"
                placeholder="m@example.com"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                <Link to="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium ml-1">Sign up</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
