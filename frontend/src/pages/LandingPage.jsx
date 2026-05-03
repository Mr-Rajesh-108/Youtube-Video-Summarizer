import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { FaYoutube, FaRobot, FaBolt } from "react-icons/fa"
import { PublicNavbar } from "../components/layout/PublicNavbar"

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">

      <PublicNavbar />

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            <div
              className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
              style={{ background: "hsl(var(--primary) / 0.12)" }}
            />
            <div
              className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse"
              style={{ background: "hsl(var(--secondary) / 0.10)", animationDelay: "1.5s" }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="max-w-4xl text-center z-10 w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-4 py-1.5 text-sm font-semibold mb-8 text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Powered by AI · Summarize any YouTube video
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 text-foreground">
              Turn hours of video into{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
              >
                minutes of insight.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Instantly generate accurate summaries, key takeaways, and chat with any YouTube
              video using advanced AI — in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link to="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base">Start Summarizing for Free</Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">View Pricing</Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-muted-foreground text-sm font-medium">
              <span className="flex items-center gap-1.5"><span className="text-primary font-bold">✓</span> Account needed</span>
              <span className="flex items-center gap-1.5"><span className="text-primary font-bold">✓</span> Unlimited basic extracts</span>
              <span className="flex items-center gap-1.5"><span className="text-primary font-bold">✓</span> 100% free to start</span>
            </div>
          </div>
        </section>

        {/* ── Feature Cards (3 col) ──────────────────────────── */}
        <section className="w-full py-20 bg-muted/40 border-t border-border" id="features">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaYoutube className="text-3xl" style={{ color: "#FF0000" }} />,
                bg: "bg-red-100/60",
                title: "Any YouTube Video",
                desc: "Just paste the URL of any public YouTube video with captions — no configuration needed.",
              },
              {
                icon: <FaRobot className="text-3xl text-primary" />,
                bg: "bg-primary/10",
                title: "Chat with Video",
                desc: "Ask specific questions and get answers directly from the transcript using conversational AI.",
              },
              {
                icon: <FaBolt className="text-3xl text-yellow-500" />,
                bg: "bg-yellow-100/60",
                title: "Lightning Fast",
                desc: "Powered by Groq's high-speed Llama models for near-instant results at any length.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-16 w-16 rounded-2xl ${f.bg} flex items-center justify-center`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bento Features Grid ────────────────────────────── */}
        <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">Core Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">Designed for Deep Understanding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[600px]">
            {/* Feature 1 */}
            <div className="md:col-span-8 bg-card rounded-2xl p-8 flex flex-col justify-between overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="max-w-md">
                <span className="text-4xl mb-5 block">⚡</span>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Fast Summarization</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our neural engine processes hours of video in milliseconds — a structured
                  breakdown of the most critical concepts without the fluff.
                </p>
              </div>
              <div className="mt-8 relative h-40 rounded-xl overflow-hidden border border-border">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGkAB7LzT4sqXqUOePes-fFYZcRoIZIM4YBsTvWgEO4xB03_LLopd-yee-PiChmM5rBCuOci1pXV8pdYtB8slTFDapSffq7a5Mk_slUpOawufIDiZCiC7OLtKMgmTsFh31e264ckZjvtgv71Ik8SzHXHezGa0QMf54LVN3y_ECOa7BsalpR9__75WjDJDNLolGOt1mCQQIACqdI-dynsLpRP-vdwDVMgT0e3WsePv6-sIpZFfer_3IJUOg8molR3hct9_1G33WNWA"
                  alt="Dashboard"
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            </div>
            {/* Feature 2 */}
            <div
              className="md:col-span-4 rounded-2xl p-8 flex flex-col justify-between shadow-xl"
              style={{ backgroundImage: "linear-gradient(145deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
            >
              <div>
                <span className="text-4xl mb-5 block">🧠</span>
                <h3 className="text-3xl font-bold mb-4 text-primary-foreground">AI Insights</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Beyond just a summary. We extract sentiment, key questions, and actionable
                  takeaways specifically for learners.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-8">
                {["Actionable", "Key Themes", "Sentiments"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/20 rounded-md text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Feature 3 */}
            <div className="md:col-span-4 bg-secondary/20 rounded-2xl p-8 flex flex-col border border-border shadow-sm">
              <span className="text-4xl mb-5 block">📄</span>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Transcript Extraction</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Full verbatim transcripts with timestamped anchors. Find exactly what you need
                without scrubbing the playhead.
              </p>
              <div className="mt-auto p-4 bg-card rounded-xl border border-border space-y-2">
                <div className="h-2 w-3/4 bg-muted rounded-full" />
                <div className="h-2 w-full bg-muted rounded-full" />
                <div className="h-2 w-1/2 bg-muted rounded-full" />
              </div>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-8 bg-muted/60 rounded-2xl p-8 flex items-center justify-between border border-border">
              <div className="max-w-sm">
                <h3 className="text-2xl font-bold mb-2 text-foreground">Universal Compatibility</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Summarize lectures, news, tech reviews, or podcasts. Any language, any length, anytime.
                </p>
              </div>
              <div className="hidden md:flex gap-4">
                {["🌐", "🎬", "🎙️"].map((icon, i) => (
                  <div key={i} className="w-16 h-16 rounded-full bg-card flex items-center justify-center shadow-sm border border-border text-2xl hover:scale-110 transition-transform duration-200">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-muted/40 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="mb-20 text-center md:text-left">
              <h2 className="text-4xl font-extrabold text-foreground mb-4">The Summarizer&apos;s Process</h2>
              <p className="text-muted-foreground max-w-xl">
                Three refined steps to transform raw video into distilled knowledge.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div
                className="hidden md:block absolute top-12 left-0 w-full h-px -z-0"
                style={{ backgroundImage: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)" }}
              />
              {[
                { icon: "📋", step: "1. Paste URL", desc: "Simply drop the YouTube link into our smart input field. No setup required." },
                { icon: "✨", step: "2. AI Distillation", desc: "Our models analyze context, tone, and key narrative peaks across the full video." },
                { icon: "📖", step: "3. Premium Summary", desc: "Receive a beautifully formatted editorial summary ready to read, share, or save." },
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center md:items-start z-10 group">
                  <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 mb-8 border-2 border-border text-4xl">
                    {s.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-foreground">{s.step}</h4>
                  <p className="text-muted-foreground text-center md:text-left leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-8">
          <div
            className="max-w-5xl mx-auto rounded-2xl p-12 md:p-20 relative overflow-hidden text-center"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground) / 0.85))" }}
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-background mb-6">
                Stop watching. Start knowing.
              </h2>
              <p className="text-background/70 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of curators using AI Summarizer to stay ahead of the information curve.
              </p>
              <Link
                to="/signup"
                className="inline-block px-10 py-4 text-primary-foreground rounded-full font-bold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
              >
                Get Your First Summary Free
              </Link>
            </div>
            <div
              className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-full blur-[100px] opacity-20"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
            />
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 font-extrabold text-xl text-foreground mb-1">
              <span
                className="text-primary-foreground px-2 py-0.5 rounded-md text-sm"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
              >
                AI
              </span>
              Summarizer
            </div>
            <p className="text-sm text-muted-foreground">© 2024 AI Summarizer. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "API", "Twitter"].map((link) => (
              <a key={link} href="#" className="text-muted-foreground hover:text-primary text-sm underline-offset-4 hover:underline transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
