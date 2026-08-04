"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            setSpeechError(`Voice error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const query = input.trim();
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
      const replyText = data.reply || data.error || "No response received from Cognito server.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: replyText },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ System offline or failed to reach the Cognito backend endpoint." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-500 overflow-hidden ${
      theme === "dark" ? "bg-[#080d1a] text-slate-100 tech-grid-bg" : "bg-slate-100 text-slate-900 light-grid-bg"
    }`}>
      {/* 1. VISIBLE FULL-SCREEN BACKEND TECH WATERMARK BACKGROUND IMAGE */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        <div className={`relative w-full h-full max-w-7xl transition-opacity duration-500 ${
          theme === "dark" ? "opacity-25 contrast-125 brightness-110" : "opacity-20 contrast-125 brightness-95"
        }`}>
          <Image
            src="/tech_watermark_bg.png"
            alt="Cognito Technology Schematic Watermark"
            fill
            priority
            className="object-contain scale-110"
          />
        </div>
      </div>

      {/* 2. DYNAMIC AMBIENT NEON GLOW ORBS (DARK MODE) */}
      {theme === "dark" ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-20 left-10 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[130px]" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[140px]" />
        </div>
      ) : (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-400/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[120px]" />
        </div>
      )}

      {/* 3. PROMINENT WATERMARK GRAPHIC BADGE (ALWAYS VISIBLE IN BOTTOM CORNER) */}
      <div className={`pointer-events-none fixed right-6 bottom-20 z-10 hidden md:flex items-center space-x-3 p-3 rounded-2xl border transition-colors duration-300 animate-float ${
        theme === "dark"
          ? "border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl"
          : "border-slate-300/80 bg-white/95 backdrop-blur-xl shadow-xl"
      }`}>
        <div className={`relative w-14 h-14 rounded-xl overflow-hidden p-1 border ${
          theme === "dark" ? "bg-slate-950 border-cyan-400/40" : "bg-slate-100 border-blue-400/50"
        }`}>
          <Image
            src="/backend_watermark_nodes.png"
            alt="Cognito Topology Watermark"
            width={56}
            height={56}
            className="object-cover rounded-lg"
          />
        </div>
        <div className="text-left font-mono">
          <p className={`text-[11px] font-bold tracking-wider uppercase ${
            theme === "dark" ? "text-cyan-300" : "text-indigo-600"
          }`}>Cognito Watermark</p>
          <p className={`text-[10px] ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Neural Mesh Architecture
          </p>
        </div>
      </div>

      {/* Header Bar */}
      <header className={`relative z-20 w-full max-w-4xl flex justify-between items-center py-3.5 px-4 sm:px-6 rounded-2xl transition-all duration-300 ${
        theme === "dark"
          ? "glass-panel shadow-2xl border border-slate-800/80"
          : "glass-panel-light shadow-xl border border-slate-200/90 text-slate-900"
      }`}>
        <div className="flex items-center space-x-3.5">
          {/* Attractive Robot Mascot Logo */}
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden p-0.5 border border-cyan-400/50 bg-gradient-to-tr from-indigo-600 to-cyan-400 shadow-md glow-cyan">
            <Image
              src="/cognito_robot_logo.png"
              alt="Cognito Robot Logo"
              width={44}
              height={44}
              priority
              className="object-cover rounded-xl"
            />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tight pb-0.5 inline-block leading-normal bg-clip-text text-transparent ${
              theme === "dark"
                ? "bg-gradient-to-r from-white via-slate-100 to-cyan-400"
                : "bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-600"
            }`}>
              Cognito
            </h1>
            <div className={`flex items-center space-x-2 text-[11px] font-mono ${
              theme === "dark" ? "text-cyan-400/90" : "text-indigo-600"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">BACKEND ONLINE</span>
              <span className={theme === "dark" ? "text-slate-500" : "text-slate-400"}>•</span>
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>v2.4 Voice Mesh</span>
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
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm"
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
            {/* Robot Mascot Hero Container */}
            <div className="relative group">
              <div className={`absolute -inset-3 rounded-full transition duration-500 animate-pulse-slow ${
                theme === "dark"
                  ? "bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-50 blur-2xl group-hover:opacity-85"
                  : "bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 opacity-40 blur-xl group-hover:opacity-70"
              }`} />
              <div className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 p-3 flex items-center justify-center shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                theme === "dark"
                  ? "border-cyan-400/50 bg-slate-950/90"
                  : "border-indigo-300/80 bg-white/95 shadow-indigo-100"
              }`}>
                <Image
                  src="/cognito_robot_logo.png"
                  alt="Cognito Robot Mascot"
                  width={190}
                  height={190}
                  priority
                  className="object-contain rounded-full filter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-float"
                />
              </div>
            </div>

            <div className="max-w-xl space-y-3">
              <h2 className={`text-4xl sm:text-6xl font-black tracking-tight pb-3 inline-block leading-normal bg-clip-text text-transparent ${
                theme === "dark"
                  ? "bg-gradient-to-r from-white via-slate-100 to-cyan-300"
                  : "bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-700"
              }`}>
                Cognito Voice AI
              </h2>
              <p className={`text-sm sm:text-base font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}>
                Type or tap the microphone inside the search bar to speak directly to Cognito AI.
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
                    : "bg-white border border-slate-200/90 text-slate-900 mr-auto max-w-[90%] shadow-md rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {m.role === "user" ? (
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold bg-white/20 text-white">
                        YOU
                      </span>
                    ) : (
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-cyan-400/50">
                        <Image
                          src="/cognito_robot_logo.png"
                          alt="Cognito Robot Avatar"
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className={`text-xs font-semibold tracking-wide uppercase font-mono ${
                      m.role === "user" ? "opacity-80" : theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      {m.role === "user" ? "User Query" : "Cognito Response"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {m.role === "assistant" && (
                      <>
                        <button
                          onClick={() => speakText(m.content)}
                          className={`p-1 rounded-md transition-colors ${
                            theme === "dark"
                              ? "hover:bg-slate-800 text-cyan-400"
                              : "hover:bg-slate-100 text-indigo-600"
                          }`}
                          title="Read out response aloud"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          theme === "dark"
                            ? "text-cyan-400/90 bg-cyan-950/80 border-cyan-500/40"
                            : "text-indigo-700 bg-indigo-50 border-indigo-200"
                        }`}>
                          Cognito Neural Stream
                        </span>
                      </>
                    )}
                  </div>
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
                    : "bg-white border-slate-300 text-slate-700 shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                  <span className={`text-xs font-mono animate-pulse ${
                    theme === "dark" ? "text-cyan-400" : "text-indigo-600"
                  }`}>
                    Querying Cognito neural backend & streaming response...
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
        {isListening && (
          <div className="mb-2 flex items-center justify-center space-x-2 text-xs font-mono text-cyan-400 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>Listening to your voice... Speak now!</span>
          </div>
        )}
        {speechError && (
          <div className="mb-2 text-center text-xs font-mono text-rose-400">
            {speechError}
          </div>
        )}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="relative w-full group">
            {/* Glowing ring under focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full blur-md opacity-35 group-hover:opacity-75 group-focus-within:opacity-100 transition duration-300" />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Cognito anything..."}
              disabled={loading}
              className={`relative w-full py-4 pl-6 pr-28 rounded-full text-sm font-normal transition-all duration-300 outline-none backdrop-blur-xl ${
                theme === "dark"
                  ? "bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:bg-slate-900 shadow-2xl"
                  : "bg-white border border-slate-300/90 text-slate-900 placeholder-slate-500 focus:border-indigo-600 shadow-xl"
              }`}
            />

            {/* Voice Assistant Microphone Button inside Search Bar */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`absolute right-14 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-red-500 text-white animate-bounce shadow-lg shadow-red-500/50"
                  : theme === "dark"
                  ? "bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300"
                  : "bg-slate-100 text-indigo-600 hover:bg-slate-200 hover:text-indigo-800"
              }`}
              title={isListening ? "Stop Listening" : "Voice Assistant Search"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7m-7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md glow-cyan"
              title="Execute Query"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
        <div className={`mt-2 text-center text-[11px] font-mono ${
          theme === "dark" ? "text-slate-400" : "text-slate-600 font-medium"
        }`}>
          Cognito Voice Assistant • Web Speech Engine Active
        </div>
      </footer>
    </div>
  );
}