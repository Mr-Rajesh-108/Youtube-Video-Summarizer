import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { verifyEmail } from "../api/auth"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { PublicNavbar } from "../components/layout/PublicNavbar"
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi"

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [status, setStatus] = useState("loading") // "loading" | "success" | "error"
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the link.")
      return
    }

    verifyEmail(token)
      .then((data) => {
        setStatus("success")
        setMessage(data.message || "Email verified! You can now log in.")
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err.message || "Verification failed. The link may have expired.")
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <PublicNavbar />

      <Card className="w-full max-w-md mt-16">
        <CardContent className="pt-10 pb-8 text-center space-y-5">
          {status === "loading" && (
            <>
              <FiLoader className="text-5xl text-primary mx-auto animate-spin" />
              <h2 className="text-xl font-bold">Verifying your email…</h2>
              <p className="text-muted-foreground">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <FiCheckCircle className="text-5xl text-green-500 mx-auto" />
              <h2 className="text-xl font-bold">Email Verified!</h2>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={() => navigate("/login")} className="mt-4">
                Log In Now
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <FiXCircle className="text-5xl text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Verification Failed</h2>
              <p className="text-muted-foreground">{message}</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={() => navigate("/signup")}>Try Signing Up Again</Button>
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
