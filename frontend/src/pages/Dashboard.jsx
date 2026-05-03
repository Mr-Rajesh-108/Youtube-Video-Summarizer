import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { useAuth } from "../context/AuthContext"
import { getUserSummaries, deleteVideoSummary, getDashboardStats } from "../api/summary"
import { FaYoutube, FaSearch, FaHistory, FaClock, FaTrash, FaVideo, FaCommentDots, FaFileAlt, FaChartLine } from "react-icons/fa"
import { FiAlertCircle } from "react-icons/fi"
import { Loader } from "../components/ui/Loader"

export function Dashboard() {
  const [url, setUrl] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()

  const [summaries, setSummaries] = useState([])
  const [stats, setStats] = useState({ totalVideos: 0, totalPrompts: 0, totalWords: 0, avgPromptsPerVideo: 0 })
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [dashboardSearch, setDashboardSearch] = useState("")

  // Load user's data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [summariesRes, statsRes] = await Promise.all([
          getUserSummaries(),
          getDashboardStats()
        ]);
        setSummaries(summariesRes.data || []);
        if (statsRes.data) setStats(statsRes.data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadData();
  }, [])

  const handleSummarize = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    // Pass the URL as state so VideoSummary page can pick it up
    navigate("/summary/new", { state: { videoUrl: url.trim() } })
  }

  const handleDelete = async (e, videoId) => {
    e.stopPropagation()
    if (!confirm("Delete all summaries for this video?")) return
    try {
      await deleteVideoSummary(videoId)
      setSummaries((prev) => prev.filter((s) => s._id !== videoId))
    } catch (err) {
      alert(err.message)
    }
  }

  // Filter and display at most 6 recent summaries on the dashboard
  const filteredSummaries = summaries.filter(s => 
    s.videoTitle.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
    s.videoUrl.toLowerCase().includes(dashboardSearch.toLowerCase())
  )
  const recentSummaries = filteredSummaries.slice(0, 6)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">Synthesize insights from any YouTube content instantly.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          <FaChartLine /> Performance Tracking Active
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FaVideo />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Videos</p>
              <p className="text-2xl font-bold">{stats.totalVideos}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <FaCommentDots />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Prompts</p>
              <p className="text-2xl font-bold">{stats.totalPrompts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <FaFileAlt />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Words Generated</p>
              <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <FaHistory />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Avg Prompts/Vid</p>
              <p className="text-2xl font-bold">{stats.avgPromptsPerVideo}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* URL Input Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-8">
          <form onSubmit={handleSummarize} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                className="h-14 pl-12 text-lg shadow-sm"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-base shadow-sm shrink-0" disabled={!url.trim()}>
              <FaSearch className="mr-2" /> Summarize Video
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Summaries */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaHistory className="text-muted-foreground" /> Recent Summaries
          </h2>
          <div className="flex items-center gap-2 flex-1 md:max-w-xs">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
              <Input 
                placeholder="Quick search..." 
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="h-9">
              View All
            </Button>
          </div>
        </div>

        {fetchError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive mb-4">
            <FiAlertCircle className="shrink-0" />
            {fetchError}
          </div>
        )}

        {loadingHistory ? (
          <div className="flex justify-center py-16"><Loader /></div>
        ) : recentSummaries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FaYoutube className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No summaries yet. Paste a YouTube URL above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSummaries.map((summary) => (
              <Card
                key={summary._id}
                className="overflow-hidden hover:shadow-md transition-all cursor-pointer group relative"
                onClick={() => navigate(`/summary/${summary._id}`, { state: { summary } })}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, summary._id)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  title="Delete"
                >
                  <FaTrash className="text-xs" />
                </button>

                {/* Thumbnail placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <FaYoutube className="text-4xl text-primary/40" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors" title={summary.videoTitle}>
                    {summary.videoTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <FaClock /> {new Date(summary.createdAt).toLocaleDateString()}
                    <span className="ml-2">· {summary.summary?.length || 0} prompt{summary.summary?.length !== 1 ? "s" : ""}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
