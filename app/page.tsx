"use client";

import { useState, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input.trim();
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
        { role: "assistant", content: data.reply || data.error || "No answer received." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Header: Dark/Light Mode Toggle */}
      <header className="w-full max-w-3xl flex justify-between items-center py-4">
        <h1 className="text-xl font-bold tracking-tight">AI Search</h1>
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border transition-all ${
            theme === "dark"
              ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
          }`}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            /* Sun Icon */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            /* Moon Icon */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl flex-1 flex flex-col justify-center my-6">
        {messages.length === 0 ? (
          <div className="text-center space-y-4 my-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ask anything
            </h2>
            <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Type your question below to receive an instant AI answer.
            </p>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto max-h-[60vh] p-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl ${
                  m.role === "user"
                    ? theme === "dark"
                      ? "bg-slate-800 text-slate-100 ml-auto max-w-[85%]"
                      : "bg-blue-600 text-white ml-auto max-w-[85%]"
                    : theme === "dark"
                    ? "bg-slate-900 border border-slate-800 text-slate-200 mr-auto max-w-[90%]"
                    : "bg-white border border-slate-200 text-slate-800 mr-auto max-w-[90%] shadow-sm"
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-60">
                  {m.role === "user" ? "You" : "Answer"}
                </p>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className={`p-4 rounded-2xl mr-auto max-w-[90%] ${
                theme === "dark" ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-500"
              }`}>
                <p className="text-xs font-semibold mb-1 opacity-60">Answer</p>
                <p className="text-sm animate-pulse">Searching for answer...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Search Bar Input */}
      <footer className="w-full max-w-3xl pb-4">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your search query..."
            disabled={loading}
            className={`w-full py-4 pl-5 pr-14 rounded-full border text-sm transition-all outline-none shadow-md ${
              theme === "dark"
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}