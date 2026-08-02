"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How does an AI backend pipeline process user requests?",
  "Explain vector embeddings and database indexing.",
  "Compare REST APIs vs GraphQL vs WebSockets for real-time AI.",
  "What is the difference between RAG and fine-tuning?"
];

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || input).trim();
    if (!query || loading) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply || data.error || "No response received from backend server." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ System offline or failed to reach the AI backend endpoint." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-500 overflow-hidden ${
      theme === "dark" ? "bg-[#080d1a] text-slate-100 tech-grid-bg" : "bg-slate-50 text-slate-900 light-grid-bg"
    }`}>
      {/* 1. VISIBLE FULL-SCREEN BACKEND TECH WATERMARK BACKGROUND IMAGE */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        <div className={`relative w-full h-full max-w-7xl transition-opacity duration-500 ${
          theme === "dark" ? "opacity-25 contrast-125 brightness-110" : "opacity-15 grayscale brightness-90"
        }`}>
          <Image
            src="/tech_watermark_bg.png"
            alt="Backend Technology Schematic Watermark"
            fill
            priority
            className="object-contain scale-110"
          />
        </div>
      </div>

      {/* 2. DYNAMIC AMBIENT NEON GLOW ORBS */}
      {theme === "dark" && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-20 left-10 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[130px]" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[140px]" />
        </div>
      )}

      {/* 3. PROMINENT WATERMARK GRAPHIC BADGE (ALWAYS VISIBLE IN BOTTOM CORNER) */}
      <div className="pointer-events-none fixed right-6 bottom-20 z-10 hidden md:flex items-center space-x-3 p-3 rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl animate-float">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 p-1 border border-cyan-400/40">
          <Image
            src="/backend_watermark_nodes.png"
            alt="Backend Topology Node Watermark"
            width={64}
            height={64}
            className="object-cover rounded-lg"
          />
        </div>
        <div className="text-left font-mono">
          <p className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase">Backend Watermark</p>
          <p className="text-[10px] text-slate-400">Neural Mesh Architecture</p>
        </div>
      </div>

      {/* Header Bar */}
      <header className="relative z-20 w-full max-w-4xl flex justify-between items-center py-4 px-4 sm:px-6 rounded-2xl glass-panel shadow-2xl border border-slate-800/80 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-lg shadow-md glow-cyan">
            AI
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Nexus AI Search Engine
            </h1>
            <div className="flex items-center space-x-2 text-[11px] text-cyan-400/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>BACKEND ONLINE</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 dark:text-slate-500">v2.4 Neural Mesh</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-900/80 border-slate-700/80 text-amber-300 hover:border-cyan-500/50 hover:bg-slate-800 shadow-md glow-cyan"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
            }`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Conversation & Watermark Hero Area */}
      <main className="relative z-20 w-full max-w-4xl flex-1 flex flex-col justify-center my-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto px-4 py-6">
            {/* Center Hero Backend Technology Watermark Container */}
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-50 blur-2xl group-hover:opacity-85 transition duration-500 animate-pulse-slow" />
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-cyan-400/40 bg-slate-950/80 p-3 flex items-center justify-center shadow-2xl backdrop-blur-xl">
                <Image
                  src="/backend_watermark_nodes.png"
                  alt="Backend Node Architecture Watermark Illustration"
                  width={170}
                  height={170}
                  className="object-contain filter drop-shadow-[0_0_16px_rgba(6,182,212,0.8)] animate-float"
                />
              </div>
            </div>

            <div className="max-w-xl space-y-3">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                Ask Anything
              </h2>
              <p className={`text-sm sm:text-base font-normal ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                Powered by full-stack backend neural stream topology & high-speed vector embeddings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto max-h-[62vh] pr-2 scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col p-5 rounded-2xl transition-all duration-300 ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white ml-auto max-w-[85%] shadow-xl glow-blue rounded-br-none"
                    : theme === "dark"
                    ? "bg-slate-900/90 border border-cyan-500/30 text-slate-100 mr-auto max-w-[90%] glass-panel shadow-2xl rounded-bl-none backdrop-blur-xl"
                    : "bg-white border border-slate-200 text-slate-800 mr-auto max-w-[90%] shadow-md rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        m.role === "user"
                          ? "bg-white/20 text-white"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      {m.role === "user" ? "YOU" : "AI"}
                    </span>
                    <span className="text-xs font-semibold tracking-wide opacity-80 uppercase font-mono">
                      {m.role === "user" ? "User Query" : "Backend AI Response"}
                    </span>
                  </div>
                  {m.role === "assistant" && (
                    <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                      Backend Neural Stream
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-sm font-normal">
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div
                className={`p-5 rounded-2xl mr-auto max-w-[90%] border backdrop-blur-xl ${
                  theme === "dark"
                    ? "bg-slate-900/80 border-cyan-500/40 text-slate-300"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-cyan-400 animate-pulse">
                    Querying neural backend & streaming response...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Search Form Area */}
      <footer className="relative z-20 w-full max-w-4xl pb-2">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="relative w-full group">
            {/* Glowing ring under focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full blur-md opacity-35 group-hover:opacity-75 group-focus-within:opacity-100 transition duration-300" />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request backend architecture design..."
              disabled={loading}
              className={`relative w-full py-4 pl-6 pr-16 rounded-full text-sm font-normal transition-all duration-300 outline-none backdrop-blur-xl ${
                theme === "dark"
                  ? "bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:bg-slate-900 shadow-2xl"
                  : "bg-white/95 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 shadow-lg"
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md glow-cyan"
              title="Execute Query"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
        <div className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Antigravity AI Neural Mesh Engine • Real-time Backend Stream
        </div>
      </footer>
    </div>
  );
}