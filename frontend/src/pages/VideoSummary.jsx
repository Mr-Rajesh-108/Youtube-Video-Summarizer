import { useState, useEffect, useRef } from "react"
import { useLocation, useParams } from "react-router-dom"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Loader } from "../components/ui/Loader"
import { createSummary, getVideoSummary } from "../api/summary"
import { FaPaperPlane, FaYoutube, FaCopy, FaFileAlt } from "react-icons/fa"
import { FiAlertCircle as FiAlert } from "react-icons/fi"

// Extract YouTube video ID from a URL
function getYouTubeId(url) {
  try {
    const u = new URL(url)
    return u.searchParams.get("v") || u.pathname.split("/").pop()
  } catch {
    return null
  }
}

export function VideoSummary() {
  const location = useLocation()
  const { id } = useParams()

  // State passed from Dashboard (new summary flow)
  const passedUrl = location.state?.videoUrl || ""
  const passedSummary = location.state?.summary || null

  const [videoUrl, setVideoUrl] = useState(passedUrl)
  const [videoTitle, setVideoTitle] = useState(passedSummary?.videoTitle || "")
  const [videoThumbnail, setVideoThumbnail] = useState(passedSummary?.thumbnail || "")
  const [summaryData, setSummaryData] = useState(passedSummary)
  const [chatInput, setChatInput] = useState("")
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef(null)

  // Load existing summary if navigated by ID
  useEffect(() => {
    if (passedSummary) return
    if (id && id !== "new") {
      setLoading(true)
      // We have the id but not the url — use passed state or show message
      if (passedSummary) {
        setSummaryData(passedSummary)
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
  }, [id])

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [summaryData?.summary])

  const videoId = getYouTubeId(videoUrl)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null
  const RAG_SERVICE_URL = import.meta.env.VITE_RAG_SERVICE_URL || "http://localhost:8001";

  // Auto-fetch metadata when URL is pasted
  useEffect(() => {
    const fetchMetadata = async () => {
      const vidId = getYouTubeId(videoUrl);
      if (vidId && !videoTitle && !summaryData) {
        try {
          const res = await fetch(`${RAG_SERVICE_URL}/metadata?url=${encodeURIComponent(videoUrl)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.title) setVideoTitle(data.title);
            if (data.thumbnail) setVideoThumbnail(data.thumbnail);
          }
        } catch (err) {
          console.error("Failed to fetch metadata:", err);
        }
      }
    };

    const timer = setTimeout(fetchMetadata, 800); // Debounce to allow full URL pasting
    return () => clearTimeout(timer);
  }, [videoUrl]);

  const handleSendPrompt = async (e, manualPrompt = null) => {
    if (e) e.preventDefault()

    const prompt = manualPrompt || chatInput.trim()
    if (!prompt) return
    if (!videoUrl) { setError("Please enter a YouTube URL first."); return }

    const title = videoTitle || `YouTube Video`
    setChatInput("")
    setGenerating(true)
    setError("")

    // Optimistically add user message
    const optimisticEntry = { prompt, response: null, _id: Date.now().toString(), timestamps: new Date() }
    setSummaryData((prev) => ({
      ...prev,
      videoTitle: title,
      videoUrl,
      summary: [...(prev?.summary || []), optimisticEntry],
    }))

    try {
      // 1. Call the AI RAG Service (Stateless Worker on port 8001)
      const ragResponse = await fetch(`${RAG_SERVICE_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, prompt: prompt })
      });

      if (!ragResponse.ok) throw new Error("AI service failed to respond.");

      const reader = ragResponse.body.getReader();
      const decoder = new TextDecoder();
      let fullAIResponse = "";
      let finalTranscript = "";

      // 2. Read the stream (SSE format)
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "token") {
                fullAIResponse += data.token;
                // Update the last message in summaryData
                setSummaryData((prev) => {
                  const newSummary = [...prev.summary];
                  newSummary[newSummary.length - 1].response = fullAIResponse;
                  return { ...prev, summary: newSummary };
                });
              } else if (data.type === "progress") {
                // You could optionally show this message in the UI
                console.log(`AI Progress: ${data.message} (${data.value}%)`);
              } else if (data.type === "complete") {
                fullAIResponse = data.summary;
                finalTranscript = data.transcript;
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              // Ignore partial JSON or malformed lines
            }
          }
        }
      }

      // 2.5 Ensure we actually got a response before saving
      if (!fullAIResponse || !finalTranscript) {
        throw new Error("The AI failed to generate a valid summary or transcript. Nothing was saved Try a new Video.");
      }

      // 3. Save the final completed summary to the standard Backend (port 5000)
      const result = await createSummary({
        videoTitle: title,
        videoUrl,
        transcript: finalTranscript,
        prompt,
        response: fullAIResponse,
        thumbnail: videoThumbnail,
        modelUsed: "Llama-3.2-1B (RAG-Service)",
      });

      setSummaryData(result.data);
    } catch (err) {
      setError(err.message);
      setSummaryData((prev) => ({
        ...prev,
        summary: prev.summary.filter((s) => s._id !== optimisticEntry._id),
      }));
    } finally {
      setGenerating(false);
    }
  }

  const handleCopy = () => {
    const text = summaryData?.summary?.map((s) => `Q: ${s.prompt}\nA: ${s.response}`).join("\n\n") || ""
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Left side: Video & Summary */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
        {/* URL Input (if no URL yet) */}
        {!videoUrl && (
          <Card>
            <div className="p-6 flex gap-3">
              <div className="relative flex-1">
                <FaYoutube className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Paste YouTube URL to begin…"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Video title input & Summarize Button */}
        {videoUrl && !summaryData?.summary?.length && (
          <Card>
            <div className="p-6 flex flex-col gap-4">
              <Input
                placeholder="Enter a title for this video (optional)"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <Button
                onClick={() => handleSendPrompt(null, "Please provide a detailed summary of this video, including key takeaways and main points.")}
                disabled={generating}
                className="w-full"
              >
                {generating ? <Loader size="sm" className="mr-2" /> : <FaFileAlt className="mr-2" />}
                Summarize Video
              </Button>
            </div>
          </Card>
        )}

        {/* YouTube Embed */}
        {embedUrl && (
          <div>
            <h1 className="text-2xl font-bold mb-4">{summaryData?.videoTitle || videoTitle || "YouTube Video"}</h1>
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm">
              <iframe
                src={embedUrl}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Summary display area */}
        {summaryData?.summary?.length > 0 && (
          <Card className="flex-1">
            <div className="border-b p-4 flex items-center justify-between bg-muted/50 rounded-t-lg">
              <h2 className="font-semibold flex items-center gap-2">
                <FaFileAlt className="text-primary" /> Summary History
              </h2>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopy}>
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy All"}
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {summaryData.summary.map((entry, i) => (
                <div key={entry._id || i} className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Q: {entry.prompt}</p>
                  <p className="text-sm text-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                    {entry.response || <span className="text-muted-foreground italic">Generating…</span>}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {!videoUrl && !summaryData && (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-muted-foreground">
            <FaYoutube className="text-6xl opacity-20" />
            <p>Paste a YouTube URL and ask a question to get started.</p>
          </div>
        )}
      </div>

      {/* Right side: Chat Input */}
      <Card className="w-full md:w-96 flex flex-col shrink-0 shadow-md">
        <div className="p-4 border-b bg-card rounded-t-lg">
          <h3 className="font-semibold">Ask about the Video</h3>
          <p className="text-xs text-muted-foreground">Ask any question about this YouTube video</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-muted/10 min-h-0">
          {summaryData?.summary?.map((msg, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg p-3 text-sm bg-primary text-primary-foreground rounded-tr-none">
                  {msg.prompt}
                </div>
              </div>
              {msg.response && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg p-3 text-sm bg-card border shadow-sm rounded-tl-none">
                    {msg.response}
                  </div>
                </div>
              )}
            </div>
          ))}
          {generating && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 text-sm bg-card border shadow-sm">
                <Loader />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10">
            <FiAlert className="shrink-0" /> {error}
          </div>
        )}

        <div className="p-4 border-t bg-card rounded-b-lg">
          <form onSubmit={handleSendPrompt} className="flex gap-2">
            <Input
              placeholder="Ask a question about this video…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1"
              disabled={generating}
            />
            <Button type="submit" size="icon" disabled={!chatInput.trim() || generating}>
              <FaPaperPlane />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
