import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserSummaries, deleteVideoSummary } from "../api/summary"
import { Loader } from "../components/ui/Loader"
import { FiSearch, FiFilter, FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiCalendar, FiMessageSquare, FiExternalLink } from "react-icons/fi"
import { FaYoutube, FaChartBar, FaLayerGroup, FaHistory, FaVideo, FaCommentDots } from "react-icons/fa"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"

const PAGE_SIZE = 9 // 3x3 grid

export function History() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    getUserSummaries()
      .then((data) => setSummaries(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = summaries.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.videoTitle.toLowerCase().includes(searchLower) ||
      item.videoUrl.toLowerCase().includes(searchLower) ||
      item.summary?.some(s => 
        s.prompt.toLowerCase().includes(searchLower) || 
        (s.response && s.response.toLowerCase().includes(searchLower))
      )
    );
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

  const totalPrompts = summaries.reduce((acc, s) => acc + (s.summary?.length || 0), 0)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8 border-border/50">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
             <FaHistory className="text-primary text-3xl" /> Archive
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and search your intelligence library.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Filter by title or content…"
              className="pl-12 pr-6 py-3.5 bg-card/50 backdrop-blur-md rounded-2xl border border-border shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-80 text-sm transition-all"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-2xl h-[50px] w-[50px]">
            <FiFilter />
          </Button>
        </div>
      </header>

      {/* Analytics Bento Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Summarized Videos", value: summaries.length, icon: FaVideo, color: "from-blue-500 to-indigo-600" },
          { label: "Intelligence Queries", value: totalPrompts, icon: FaCommentDots, color: "from-purple-500 to-pink-600" },
          { label: "Library Match", value: filtered.length, icon: FaLayerGroup, color: "from-orange-400 to-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group border-none shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
            <CardContent className="p-6">
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-card border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                     <stat.icon className="text-2xl text-primary" />
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader size="lg" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Retrieving your insights...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center border rounded-3xl bg-destructive/5 border-destructive/20">
          <p className="text-destructive font-semibold">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginated.map((item) => (
              <Card
                key={item._id}
                className="group border border-border/50 bg-card overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col rounded-3xl"
                onClick={() => navigate(`/summary/${item._id}`, { state: { summary: item } })}
              >
                {/* Visual Thumbnail Section */}
                <div className="relative aspect-video overflow-hidden">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.videoTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                       <FaYoutube className="text-5xl text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
                         <FiCalendar /> {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter bg-primary/80 backdrop-blur-md px-2 py-1 rounded-lg">
                         <FiMessageSquare /> {item.summary?.length || 0} PROMPTS
                      </div>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {item.videoTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-60 line-clamp-1">
                      <FiExternalLink /> {item.videoUrl}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                    <div className="flex gap-1.5">
                      <button 
                         onClick={(e) => { e.stopPropagation(); window.open(item.videoUrl, '_blank') }}
                         className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
                         title="Original Video"
                      >
                         <FaYoutube className="text-lg" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(e, item._id)}
                        className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                       >
                         <FiTrash2 />
                       </Button>
                       <Button 
                        size="sm" 
                        className="rounded-xl font-bold px-4"
                       >
                         Open Insights
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="py-24 text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
               <div className="w-20 h-20 rounded-full bg-card mx-auto flex items-center justify-center shadow-md">
                 <FaHistory className="text-3xl text-muted-foreground/30" />
               </div>
               <div className="space-y-1">
                 <h2 className="text-xl font-bold">Intelligence not found</h2>
                 <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                   {search ? `We couldn't find any results for "${search}". Try a different keyword.` : "Your library is currently empty. Start by summarizing a video."}
                 </p>
               </div>
               {!search && <Button onClick={() => navigate('/dashboard')} className="rounded-2xl">Return to Workspace</Button>}
            </div>
          )}

          {/* Premium Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border/30">
              <p className="text-sm font-semibold text-muted-foreground">
                Showing <span className="text-foreground">{ (page - 1) * PAGE_SIZE + 1 }</span> – <span className="text-foreground">{ Math.min(page * PAGE_SIZE, filtered.length) }</span> of <span className="text-foreground">{ filtered.length }</span> results
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl h-10 w-10 border-border/50"
                >
                  <FiChevronLeft />
                </Button>
                
                <div className="flex items-center gap-2 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        p === page 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                        : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl h-10 w-10 border-border/50"
                >
                  <FiChevronRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
