import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { useAuth } from "../context/AuthContext"
import { updateProfile, deleteAccount } from "../api/auth"
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"

export function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Profile section
  const [name, setName] = useState(user?.name || "")
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password section
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passMsg, setPassMsg] = useState({ type: "", text: "" })
  const [passLoading, setPassLoading] = useState(false)

  // Groq API key (stored locally only)
  const [groqKey, setGroqKey] = useState(localStorage.getItem("groqApiKey") || "")

  // Delete account
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSaveName = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setProfileLoading(true)
    setProfileMsg({ type: "", text: "" })
    try {
      await updateProfile({ name })
      localStorage.setItem("user", JSON.stringify({ ...user, name }))
      setProfileMsg({ type: "success", text: "Name updated successfully." })
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (!password) return
    if (password !== confirmPassword) {
      setPassMsg({ type: "error", text: "Passwords do not match." })
      return
    }
    setPassLoading(true)
    setPassMsg({ type: "", text: "" })
    try {
      await updateProfile({ password })
      setPassword("")
      setConfirmPassword("")
      setPassMsg({ type: "success", text: "Password updated successfully." })
    } catch (err) {
      setPassMsg({ type: "error", text: err.message })
    } finally {
      setPassLoading(false)
    }
  }

  const handleSaveGroqKey = () => {
    localStorage.setItem("groqApiKey", groqKey)
    alert("Groq API key saved locally.")
  }

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account and all data. Are you sure?")) return
    setDeleteLoading(true)
    try {
      await deleteAccount()
      await logout()
      navigate("/")
    } catch (err) {
      alert(err.message)
      setDeleteLoading(false)
    }
  }

  const StatusMsg = ({ msg }) =>
    msg.text ? (
      <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
        msg.type === "success"
          ? "border border-green-500/40 bg-green-500/10 text-green-600"
          : "border border-destructive/40 bg-destructive/10 text-destructive"
      }`}>
        {msg.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
        {msg.text}
      </div>
    ) : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Name */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Name</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveName}>
            <CardContent className="space-y-4">
              <StatusMsg msg={profileMsg} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Saving…" : "Save Name"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a strong password with letters, numbers, and special characters.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSavePassword}>
            <CardContent className="space-y-4">
              <StatusMsg msg={passMsg} />
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={passLoading} variant="secondary">
                {passLoading ? "Updating…" : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Groq API Key */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Enter your Groq API Key to use your own limits for AI summaries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Groq API Key</label>
              <Input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
              />
              <p className="text-xs text-muted-foreground">Stored only in your browser's local storage — never sent to our servers.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="secondary" onClick={handleSaveGroqKey}>Save API Key</Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900 bg-red-50/10">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete your account and all associated data. This cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete My Account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
