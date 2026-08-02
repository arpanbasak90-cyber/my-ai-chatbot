"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string; timestamp?: string };

const SUGGESTIONS = [
  { icon: "💡", title: "Brainstorm Ideas", prompt: "Give me 5 creative ideas for a tech startup in 2026." },
  { icon: "💻", title: "Write & Debug Code", prompt: "Explain how React 19 server components work with code examples." },
  { icon: "📝", title: "Summarize Content", prompt: "Draft a clear, professional email summarizing project updates." },
  { icon: "🚀", title: "Optimize Productivity", prompt: "What are the best time-management frameworks for software developers?" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (customContent?: string) => {
    const textToSend = customContent || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend, timestamp: getTimeString() };
    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    if (!customContent) setInput("");
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
        { role: "assistant", content: data.reply || data.error || "Sorry, I couldn't process that response.", timestamp: getTimeString() },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Network Error: Unable to reach the backend server.", timestamp: getTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Background Orbs & Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/20 blur-[120px] animate-pulse-slow" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />

      {/* Sidebar */}
      <aside
        className={`relative z-20 flex flex-col border-r border-slate-800/60 glass-panel transition-all duration-300 ${
          sidebarOpen ? "w-64 sm:w-72" : "w-0 md:w-16"
        } overflow-hidden`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/40">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-md shadow-cyan-500/20">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Aura AI
              </span>
            </div>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Sidebar Main Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 font-medium text-sm transition group"
          >
            <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span>New Conversation</span>}
          </button>

          {sidebarOpen && (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recent Chats
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/40 border border-slate-700/40 truncate cursor-pointer hover:bg-slate-800/70 transition">
                <svg className="h-4 w-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="truncate">Current Session</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-800/40">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="relative h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 border border-cyan-500/30 shrink-0">
                AI
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">Gemini Engine</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span>●</span> Ready & Active
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/40 glass-panel shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Intelligent Assistant
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">Ask anything, generate ideas, or refine your workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition"
            >
              Clear Chat
            </button>
          </div>
        </header>

        {/* Message Stream / Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 animate-float py-8">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 text-cyan-400 shadow-xl glow-cyan mb-2">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  How can I help you today?
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Type a prompt below or pick from one of the quick suggestions to start a conversation.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    className="p-4 rounded-xl glass-card text-slate-200 text-sm transition duration-200 group relative flex flex-col justify-between h-28"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{item.icon}</span>
                      <svg className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 sm:gap-4 items-start ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none glow-cyan"
                        : "glass-card text-slate-100 border border-slate-800/80 rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    {m.timestamp && (
                      <div
                        className={`text-[10px] mt-2 opacity-60 flex items-center justify-end ${
                          m.role === "user" ? "text-cyan-100" : "text-slate-400"
                        }`}
                      >
                        {m.timestamp}
                      </div>
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold shrink-0 text-xs">
                      YOU
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 sm:gap-4 justify-start items-start">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20 animate-pulse">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="glass-card text-slate-300 border border-slate-800/80 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <div className="flex space-x-1.5">
                      <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-slate-400 font-medium ml-1">Formulating response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-800/40 glass-panel shrink-0">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask Aura anything..."
              disabled={loading}
              className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl py-3.5 pl-4 pr-14 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none shadow-inner disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-cyan-500/20"
              title="Send message"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-center text-slate-500 mt-2">
            Aura AI can make mistakes. Verify important facts.
          </p>
        </div>
      </main>
    </div>
  );
}