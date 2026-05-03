import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { PublicNavbar } from "../components/layout/PublicNavbar"
import { signup as apiSignup } from "../api/auth"
import { FaYoutube, FaEye, FaEyeSlash } from "react-icons/fa"
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"

export function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.")
      return
    }
    setLoading(true)
    try {
      const data = await apiSignup(form)
      setSuccess(data.message || "Registration successful! Please check your email to verify your account.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Success state — show check email message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <PublicNavbar />
        <Card className="w-full max-w-md mt-16 text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="flex justify-center">
              <FiCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Check your inbox!</h2>
            <p className="text-muted-foreground">{success}</p>
            <Button variant="outline" onClick={() => navigate("/login")} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your details below to get started</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <FiAlertCircle className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="name">Full Name</label>
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

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
              <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 chars, letters + numbers + symbols"
                  autoComplete="new-password"
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
              <p className="text-xs text-muted-foreground">Must contain letters, numbers &amp; a special character (@$!%*#?&amp;)</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium ml-1">Log in</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
