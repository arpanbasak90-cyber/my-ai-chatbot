"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = { role: "user" | "assistant"; content: string };

type LanguageOption = {
  code: string; // BCP-47 tag for Speech API
  countryCode: string; // ISO 3166-1 alpha-2 tag for FlagCDN
  name: string;
  nativeName: string;
  placeholder: string;
  listeningText: string;
  subtext: string;
};

const LANGUAGES: LanguageOption[] = [
  {
    code: "en-US",
    countryCode: "us",
    name: "English",
    nativeName: "English",
    placeholder: "Ask Pragya AI anything...",
    listeningText: "Listening to your voice...",
    subtext: "Type or tap the microphone inside the search bar to speak directly to Pragya AI.",
  },
  {
    code: "bn-IN",
    countryCode: "in",
    name: "Bengali",
    nativeName: "বাংলা",
    placeholder: "প্রজ্ঞাকে যেকোনো কিছু জিজ্ঞাসা করুন...",
    listeningText: "আপনার কথা শুনছি... এখন বলুন!",
    subtext: "প্রজ্ঞার সাথে কথা বলতে টাইপ করুন অথবা সার্চ বারের মাইক্রোফোনে আলতো চাপুন।",
  },
  {
    code: "hi-IN",
    countryCode: "in",
    name: "Hindi",
    nativeName: "हिन्दी",
    placeholder: "प्रज्ञा से कुछ भी पूछें...",
    listeningText: "आपकी आवाज़ सुन रहे हैं... अब बोलें!",
    subtext: "प्रज्ञा एआई से बात करने के लिए टाइप करें या सर्च बार में माइक्रोफ़ोन पर टैप करें।",
  },
  {
    code: "es-ES",
    countryCode: "es",
    name: "Spanish",
    nativeName: "Español",
    placeholder: "Pregúntale a Pragya lo que sea...",
    listeningText: "Escuchando tu voz... ¡Habla ahora!",
    subtext: "Escribe o toca el micrófono en la barra de búsqueda para hablar con Pragya AI.",
  },
  {
    code: "fr-FR",
    countryCode: "fr",
    name: "French",
    nativeName: "Français",
    placeholder: "Demandez n'importe quoi à Pragya...",
    listeningText: "À l'écoute de votre voix... Parlez maintenant!",
    subtext: "Tapez ou appuyez sur le microphone dans la barre de recherche pour parler à Pragya AI.",
  },
  {
    code: "de-DE",
    countryCode: "de",
    name: "German",
    nativeName: "Deutsch",
    placeholder: "Fragen Sie Pragya etwas...",
    listeningText: "Höre deiner Stimme zu... Sprich jetzt!",
    subtext: "Geben Sie Ihren Text ein oder tippen Sie auf das Mikrofon, um mit Pragya AI zu sprechen.",
  },
  {
    code: "ja-JP",
    countryCode: "jp",
    name: "Japanese",
    nativeName: "日本語",
    placeholder: "Pragyaに何でも質問してください...",
    listeningText: "音声を聞き取っています... 今すぐ話し始めてください！",
    subtext: "Pragya AIと会話するには、メッセージを入力するかマイクをタップしてください。",
  },
  {
    code: "zh-CN",
    countryCode: "cn",
    name: "Chinese",
    nativeName: "中文",
    placeholder: "向 Pragya 提问任何问题...",
    listeningText: "正在聆听您的声音... 请说话！",
    subtext: "输入文字或点击搜索栏中的麦克风直接与 Pragya AI 交谈。",
  },
  {
    code: "ar-SA",
    countryCode: "sa",
    name: "Arabic",
    nativeName: "العربية",
    placeholder: "اسأل براغيا أي شيء...",
    listeningText: "جاري الاستماع إلى صوتك... تحدث الآن!",
    subtext: "اكتب أو انقر على الميكروفون في شريط البحث للتحدث مباشرة إلى Pragya AI.",
  },
  {
    code: "ru-RU",
    countryCode: "ru",
    name: "Russian",
    nativeName: "Русский",
    placeholder: "Спросите Pragya о чем угодно...",
    listeningText: "Слушаю ваш голос... Говорите!",
    subtext: "Введите текст или нажмите на микрофон в строке поиска, чтобы поговорить с Pragya AI.",
  },
  {
    code: "pt-BR",
    countryCode: "br",
    name: "Portuguese",
    nativeName: "Português",
    placeholder: "Pergunte qualquer coisa ao Pragya...",
    listeningText: "Ouvindo sua voz... Fale agora!",
    subtext: "Digite ou toque no microfone na barra de pesquisa para falar com Pragya AI.",
  },
  {
    code: "it-IT",
    countryCode: "it",
    name: "Italian",
    nativeName: "Italiano",
    placeholder: "Chiedi qualsiasi cosa a Pragya...",
    listeningText: "Ascoltando la tua voce... Parla ora!",
    subtext: "Scrivi o tocca il microfono nella barra di ricerca per parlare con Pragya AI.",
  },
  {
    code: "ko-KR",
    countryCode: "kr",
    name: "Korean",
    nativeName: "한국어",
    placeholder: "Pragya에게 무엇이든 물어보세요...",
    listeningText: "음성을 듣고 있습니다... 지금 말씀하세요!",
    subtext: "Pragya AI와 대화하려면 메시지를 입력하거나 마이크를 탭하세요.",
  },
  {
    code: "tr-TR",
    countryCode: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    placeholder: "Pragya'ya her şeyi sorun...",
    listeningText: "Sesiniz dinleniyor... Şimdi konuşun!",
    subtext: "Pragya AI ile konuşmak için yazın veya arama çubuğundaki mikrofona dokunun.",
  },
  {
    code: "ta-IN",
    countryCode: "in",
    name: "Tamil",
    nativeName: "தமிழ்",
    placeholder: "பிரக்யாவிடம் எதுவாக இருந்தாலும் கேளுங்கள்...",
    listeningText: "உங்கள் குரலைக் கேட்கிறது... இப்போது பேசுங்கள்!",
    subtext: "பிரக்யா AI உடன் பேச தட்டச்சு செய்யவும் அல்லது மைக்ரோஃபோனைத் தொடவும்.",
  },
  {
    code: "te-IN",
    countryCode: "in",
    name: "Telugu",
    nativeName: "తెలుగు",
    placeholder: "ప్రజ్ఞను ఏదైనా అడగండి...",
    listeningText: "మీ వాయిస్ వింటోంది... ఇప్పుడు మాట్లాడండి!",
    subtext: "ప్రజ్ఞ AIతో మాట్లాడటానికి టైప్ చేయండి లేదా మైక్రోఫోన్‌ను నొక్కండి.",
  },
  {
    code: "mr-IN",
    countryCode: "in",
    name: "Marathi",
    nativeName: "मराठी",
    placeholder: "प्रज्ञाला काहीही विचारा...",
    listeningText: "तुमचा आवाज ऐकत आहे... आता बोला!",
    subtext: "प्रज्ञा AI शी बोलण्यासाठी टाईप करा किंवा मायक्रोफोनवर टॅप करा.",
  },
  {
    code: "gu-IN",
    countryCode: "in",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    placeholder: "પ્રજ્ઞાને કંઈપણ પૂછો...",
    listeningText: "તમારો અવાજ સાંભળી રહ્યા છીએ... હવે બોલો!",
    subtext: "પ્રજ્ઞા AI સાથે વાત કરવા માટે ટાઇપ કરવા અથવા માઇક્રોફોન પર ટેપ કરો.",
  },
  {
    code: "kn-IN",
    countryCode: "in",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    placeholder: "ಪ್ರಜ್ಞಾಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...",
    listeningText: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಕೇಳಲಾಗುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ!",
    subtext: "ಪ್ರಜ್ಞಾ AI ನೊಂದಿಗೆ ಮಾತನಾಡಲು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ರೊಫೋನ್ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.",
  },
  {
    code: "ml-IN",
    countryCode: "in",
    name: "Malayalam",
    nativeName: "മലയാളം",
    placeholder: "പ്രജ്ഞയോട് എന്ത് വേണമെങ്കിലും ചോദിക്കൂ...",
    listeningText: "നിങ്ങളുടെ ശബ്ദം കേൾക്കുന്നു... ഇപ്പോൾ സംസാരിക്കൂ!",
    subtext: "പ്രജ്ഞ AI-യുമായി സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക.",
  },
  {
    code: "id-ID",
    countryCode: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    placeholder: "Tanyakan apa saja kepada Pragya...",
    listeningText: "Mendengarkan suara Anda... Bicara sekarang!",
    subtext: "Ketik atau ketuk mikrofon di bilah pencarian untuk berbicara dengan Pragya AI.",
  },
  {
    code: "vi-VN",
    countryCode: "vn",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    placeholder: "Hỏi Pragya bất cứ điều gì...",
    listeningText: "Đang lắng nghe giọng nói của bạn... Hãy nói ngay!",
    subtext: "Nhập hoặc chạm vào micro trong thanh tìm kiếm để trò chuyện với Pragya AI.",
  },
  {
    code: "nl-NL",
    countryCode: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    placeholder: "Vraag Pragya van alles...",
    listeningText: "Luisteren naar je stem... Spreek nu!",
    subtext: "Typ of tik op de microfoon in de zoekbalk om met Pragya AI te spreken.",
  },
  {
    code: "pl-PL",
    countryCode: "pl",
    name: "Polish",
    nativeName: "Polski",
    placeholder: "Zapytaj Pragya o cokolwiek...",
    listeningText: "Słucham Twojego głosu... Mów teraz!",
    subtext: "Wpisz lub dotknij mikrofonu w pasku wyszukiwania, aby porozmawiać z Pragya AI.",
  },
  {
    code: "th-TH",
    countryCode: "th",
    name: "Thai",
    nativeName: "ไทย",
    placeholder: "ถามอะไรก็ได้กับ Pragya...",
    listeningText: "กำลังฟังเสียงของคุณ... พูดได้เลย!",
    subtext: "พิมพ์หรือแตะไมโครโฟนในแถบค้นหาเพื่อพูดคุยกับ Pragya AI",
  },
];

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [selectedLangCode, setSelectedLangCode] = useState<string>("en-US");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState<boolean>(false);
  const voiceMenuRef = useRef<HTMLDivElement>(null);

  const [attachedFile, setAttachedFile] = useState<{ fileName: string; text: string } | null>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchChatHistory = async () => {
    setFetchingHistory(true);
    setHistoryError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("/api/chat", { signal: controller.signal });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.messages && Array.isArray(data.messages)) {
        const loaded: Message[] = data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        }));
        setHistoryMessages(loaded);
        if (data.error && loaded.length === 0) {
          setHistoryError(data.error);
        }
        return loaded;
      } else if (data?.error) {
        setHistoryError(data.error);
      }
    } catch (err: any) {
      console.error("Failed to load chat history from MongoDB:", err);
      setHistoryError(err?.message || "Failed to connect to MongoDB server");
    } finally {
      clearTimeout(timeoutId);
      setFetchingHistory(false);
    }
    return [];
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history from MongoDB?")) return;
    setFetchingHistory(true);
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      if (res.ok) {
        setHistoryMessages([]);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleLoadHistoryToChat = () => {
    if (historyMessages.length > 0) {
      setMessages(historyMessages);
      setIsHistoryOpen(false);
    }
  };

  const currentLang =
    LANGUAGES.find((l) => l.code === selectedLangCode) || LANGUAGES[0];

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Load available system voices (Male / Female)
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Close custom dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
      if (
        voiceMenuRef.current &&
        !voiceMenuRef.current.contains(event.target as Node)
      ) {
        setIsVoiceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load past chat history from MongoDB when the page first opens
  useEffect(() => {
    const loadHistory = async () => {
      const loaded = await fetchChatHistory();
      if (loaded.length > 0) {
        setMessages(loaded);
      }
    };
    loadHistory();
  }, []);

  // Auto-fetch history when history drawer opens
  useEffect(() => {
    if (isHistoryOpen) {
      fetchChatHistory();
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Initialize and re-bind speech recognition when selected language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);

        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {
            // ignore
          }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedLangCode;

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
  }, [selectedLangCode]);

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
        recognitionRef.current.lang = selectedLangCode;
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
    utterance.lang = selectedLangCode;

    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    // Find specifically selected voice or matching language voice
    let voiceToUse = voices.find((v) => v.voiceURI === selectedVoiceURI);

    if (!voiceToUse) {
      const langPrefix = selectedLangCode.split("-")[0];
      voiceToUse =
        voices.find((v) => v.lang === selectedLangCode) ||
        voices.find((v) => v.lang.startsWith(langPrefix));
    }

    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNewChat = () => {
    if (isSpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setMessages([]);
    setInput("");
    setSpeechError(null);
    setAttachedFile(null);
    fetchChatHistory();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    setSpeechError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || "Failed to process document.");
      } else {
        setAttachedFile({
          fileName: data.fileName,
          text: data.text,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading document.");
    } finally {
      setParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const query = input.trim();
    if (!query || loading) return;

    setInput("");

    // Inject attached file content into user message context if present
    let userContent = query;
    if (attachedFile) {
      userContent = `[ATTACHED DOCUMENT: "${attachedFile.fileName}"]\n${attachedFile.text}\n\n[USER QUESTION]\n${query}`;
    }

    const displayedQuery = attachedFile ? `📄 [${attachedFile.fileName}] ${query}` : query;

    const newMessages: Message[] = [...messages, { role: "user", content: userContent }];
    const displayMessages: Message[] = [...messages, { role: "user", content: displayedQuery }];
    setMessages(displayMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          language: currentLang.name,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        const replyText = data?.reply || data?.error || "Failed to reach Pragya AI backend.";
        setMessages([
          ...displayMessages,
          { role: "assistant", content: replyText },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedReply = "";

      // Add placeholder assistant message and turn off spinner once stream starts
      setMessages([
        ...displayMessages,
        { role: "assistant", content: "" },
      ]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedReply += chunk;
        setMessages([
          ...displayMessages,
          { role: "assistant", content: streamedReply },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...displayMessages,
        { role: "assistant", content: "⚠️ System offline or failed to reach the Pragya backend endpoint." },
      ]);
    } finally {
      setLoading(false);
      fetchChatHistory();
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-300 overflow-hidden ${theme === "dark" ? "bg-[#0b0f17] text-slate-100" : "bg-white text-slate-900"
      }`}>

      {/* Header Bar */}
      <header className={`relative z-50 w-full max-w-4xl flex justify-between items-center py-3.5 px-4 sm:px-6 rounded-2xl transition-all duration-300 ${theme === "dark"
        ? "glass-panel shadow-2xl border border-slate-800/80"
        : "glass-panel-light shadow-xl border border-slate-200/90 text-slate-900"
        }`}>
        <div className="flex items-center space-x-3.5">
          {/* Flower Logo */}
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden p-0.5 border border-cyan-400/50 bg-gradient-to-tr from-cyan-500 to-indigo-500 shadow-md glow-cyan">
            <Image
              src="/flower_logo.png"
              alt="Pragya AI Flower Logo"
              width={40}
              height={40}
              priority
              className="object-cover rounded-xl"
            />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tight leading-normal pb-1 inline-block bg-clip-text text-transparent ${theme === "dark"
              ? "bg-gradient-to-r from-white via-slate-100 to-cyan-400"
              : "bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-600"
              }`}>
              Pragya AI
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* VOICE TONE SELECTION MENU (MALE / FEMALE) */}
          <div className="relative" ref={voiceMenuRef}>
            <button
              type="button"
              onClick={() => setIsVoiceMenuOpen((prev) => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 outline-none ${theme === "dark"
                ? "bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-md glow-cyan"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm"
                }`}
              title="Select Voice Tone (Male / Female)"
            >
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>
                {selectedVoiceURI
                  ? availableVoices.find((v) => v.voiceURI === selectedVoiceURI)?.name.split(" ")[0] || "Voice"
                  : "Voice Tone"}
              </span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isVoiceMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Custom Voice Tone Dropdown Menu */}
            {isVoiceMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-2xl z-50 backdrop-blur-xl border scrollbar-thin ${theme === "dark"
                  ? "bg-slate-900/95 border-cyan-500/40 text-slate-100 shadow-cyan-950/80"
                  : "bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/80"
                  }`}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700/40 mb-1">
                  Select AI Voice (Male / Female)
                </div>
                {availableVoices.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Loading browser voices...</div>
                ) : (
                  availableVoices.map((voice) => {
                    const isSelected = voice.voiceURI === selectedVoiceURI;
                    const isFemale = voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("zira") || voice.name.toLowerCase().includes("susan") || voice.name.toLowerCase().includes("samantha") || voice.name.toLowerCase().includes("karen") || voice.name.toLowerCase().includes("google uk english female");
                    const isMale = voice.name.toLowerCase().includes("male") || voice.name.toLowerCase().includes("david") || voice.name.toLowerCase().includes("mark") || voice.name.toLowerCase().includes("george") || voice.name.toLowerCase().includes("google uk english male");

                    return (
                      <button
                        key={voice.voiceURI}
                        type="button"
                        onClick={() => {
                          setSelectedVoiceURI(voice.voiceURI);
                          setIsVoiceMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${isSelected
                          ? theme === "dark"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : theme === "dark"
                            ? "hover:bg-slate-800/80 text-slate-200"
                            : "hover:bg-slate-100 text-slate-800"
                          }`}
                      >
                        <div className="flex items-center space-x-2 text-left truncate mr-2">
                          <span>{isFemale ? "👩" : isMale ? "👨" : "🗣️"}</span>
                          <div className="flex flex-col truncate">
                            <span className="leading-tight truncate">{voice.name}</span>
                            <span className="text-[10px] opacity-60 font-normal">{voice.lang}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {/* CUSTOM FUTURISTIC LANGUAGE SELECTOR WITH REAL NATIONAL FLAG IMAGES */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 outline-none ${theme === "dark"
                ? "bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-md glow-cyan"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm"
                }`}
              title="Select Language"
            >
              {/* Crisp Flag Image */}
              <img
                src={`https://flagcdn.com/w40/${currentLang.countryCode}.png`}
                alt={currentLang.name}
                className="w-5 h-3.5 object-cover rounded-sm border border-slate-500/40 shadow-sm"
              />
              <span>{currentLang.nativeName}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Custom Animated Dropdown Menu */}
            {isLangMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-2xl z-50 backdrop-blur-xl border scrollbar-thin ${theme === "dark"
                  ? "bg-slate-900/95 border-cyan-500/40 text-slate-100 shadow-cyan-950/80"
                  : "bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/80"
                  }`}
              >
                {LANGUAGES.map((lang) => {
                  const isSelected = lang.code === selectedLangCode;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLangCode(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${isSelected
                        ? theme === "dark"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : theme === "dark"
                          ? "hover:bg-slate-800/80 text-slate-200"
                          : "hover:bg-slate-100 text-slate-800"
                        }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={`https://flagcdn.com/w40/${lang.countryCode}.png`}
                          alt={lang.name}
                          className="w-5 h-3.5 object-cover rounded-sm border border-slate-500/40 shadow-sm"
                        />
                        <div className="flex flex-col text-left">
                          <span className="leading-tight">{lang.nativeName}</span>
                          <span className="text-[10px] opacity-65 font-normal">{lang.name}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ChatGPT Style New Chat Button */}
          <button
            onClick={handleNewChat}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${theme === "dark"
              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400 shadow-md glow-cyan"
              : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm"
              }`}
            title="Start a new chat session"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Chat History Drawer Toggle Button */}
          <button
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${theme === "dark"
                ? "bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-md glow-cyan"
                : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm"
              }`}
            title="Toggle Chat History (MongoDB)"
          >
            <svg className="w-4 h-4 text-cyan-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${theme === "dark"
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
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Conversation & Watermark Hero Area */}
      <main className="relative z-10 w-full max-w-4xl flex-1 flex flex-col justify-center my-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto px-4 py-6">
            {/* Big Flower Logo Hero Icon */}
            <div className="relative group">
              <div className={`absolute -inset-3 rounded-full transition duration-500 animate-pulse-slow ${theme === "dark"
                ? "bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-50 blur-2xl group-hover:opacity-85"
                : "bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300 opacity-60 blur-xl group-hover:opacity-80"
                }`} />
              <div className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 p-3 flex items-center justify-center shadow-2xl backdrop-blur-xl transition-all duration-300 ${theme === "dark"
                ? "border-cyan-400/50 bg-slate-950/90"
                : "border-indigo-300/80 bg-white shadow-indigo-100"
                }`}>
                <Image
                  src="/flower_logo.png"
                  alt="Pragya AI Flower Mascot"
                  width={150}
                  height={150}
                  priority
                  className="object-contain rounded-full filter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                />
              </div>
            </div>

            <div className="max-w-xl space-y-3">
              <h2 className={`text-4xl sm:text-6xl font-black tracking-tight pb-2 inline-block leading-normal bg-clip-text text-transparent ${theme === "dark"
                ? "bg-gradient-to-r from-white via-slate-100 to-cyan-300"
                : "bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-700"
                }`}>
                Pragya AI
              </h2>
            </div>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto max-h-[62vh] pr-2 scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col p-5 rounded-2xl transition-all duration-300 ${m.role === "user"
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
                          src="/flower_logo.png"
                          alt="Pragya Flower Avatar"
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className={`text-xs font-semibold tracking-wide uppercase font-mono ${m.role === "user" ? "opacity-80" : theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }`}>
                      {m.role === "user" ? "User Query" : "Pragya Response"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {m.role === "assistant" && (
                      <>
                        <button
                          onClick={() => speakText(m.content)}
                          className={`p-1 rounded-md transition-colors ${isSpeaking
                            ? "bg-amber-500/20 text-amber-400 animate-pulse"
                            : theme === "dark"
                              ? "hover:bg-slate-800 text-cyan-400"
                              : "hover:bg-slate-100 text-indigo-600"
                            }`}
                          title={`Read aloud in ${currentLang.nativeName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${theme === "dark"
                          ? "text-cyan-400/90 bg-cyan-950/80 border-cyan-500/40"
                          : "text-indigo-700 bg-indigo-50 border-indigo-200"
                          }`}>
                          Pragya Neural Stream
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
                className={`p-5 rounded-2xl mr-auto max-w-[90%] border backdrop-blur-xl ${theme === "dark"
                  ? "bg-slate-900/80 border-cyan-500/40 text-slate-300"
                  : "bg-white border-slate-300 text-slate-700 shadow-sm"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                  <span className={`text-xs font-mono animate-pulse ${theme === "dark" ? "text-cyan-400" : "text-indigo-600"
                    }`}>
                    Querying Pragya neural backend & streaming response...
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
            <span>{currentLang.listeningText}</span>
          </div>
        )}
        {speechError && (
          <div className="mb-2 text-center text-xs font-mono text-rose-400 bg-rose-950/40 py-1 px-3 rounded-lg border border-rose-500/30 max-w-md mx-auto">
            {speechError.includes("not-allowed")
              ? "⚠️ Microphone access denied by browser! Please click the lock 🔒 icon in your address bar and allow Microphone permissions."
              : speechError}
          </div>
        )}
        {/* Attached Document Indicator Badge */}
        {attachedFile && (
          <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono max-w-lg mx-auto backdrop-blur-md">
            <div className="flex items-center space-x-2 truncate">
              <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate font-semibold">{attachedFile.fileName}</span>
              <span className="text-[10px] text-cyan-400/70">({attachedFile.text.length} chars)</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="ml-2 text-rose-400 hover:text-rose-300 p-0.5 rounded"
              title="Remove document"
            >
              ✕
            </button>
          </div>
        )}

        {parsingFile && (
          <div className="mb-2 text-center text-xs font-mono text-cyan-400 animate-pulse">
            ⚡ Parsing document content... Please wait.
          </div>
        )}

        <form onSubmit={handleSearch} className="relative flex items-center">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.json,.csv"
            className="hidden"
          />

          <div className="relative w-full group">
            {/* Glowing ring under focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full blur-md opacity-35 group-hover:opacity-75 group-focus-within:opacity-100 transition duration-300" />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={attachedFile ? `Ask Pragya about "${attachedFile.fileName}"...` : isListening ? currentLang.listeningText : currentLang.placeholder}
              disabled={loading || parsingFile}
              className={`relative w-full py-4 pl-12 pr-28 rounded-full text-sm font-normal transition-all duration-300 outline-none backdrop-blur-xl ${theme === "dark"
                ? "bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:bg-slate-900 shadow-2xl"
                : "bg-white border border-slate-300/90 text-slate-900 placeholder-slate-500 focus:border-indigo-600 shadow-xl"
                }`}
            />

            {/* Document Upload Clip Button on Left */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || parsingFile}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${attachedFile
                ? "text-cyan-400 bg-cyan-500/20 border border-cyan-400/50"
                : theme === "dark"
                  ? "text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              title="Attach Document (PDF, DOCX, PPTX, TXT)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Voice Assistant Futuristic Glowing Microphone Graphic Button inside Search Bar */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full p-1 border transition-all duration-300 flex items-center justify-center ${isListening
                ? "bg-red-500/20 border-red-500 animate-pulse shadow-lg shadow-red-500/50 scale-110"
                : theme === "dark"
                  ? "bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 hover:scale-105 shadow-md shadow-cyan-950"
                  : "bg-slate-100 border-indigo-300 hover:border-indigo-500 hover:scale-105 shadow-sm"
                }`}
              title={isListening ? "Stop Listening" : `Voice Assistant (${currentLang.name})`}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src="/mic_icon.png"
                  alt="Futuristic Voice Assistant Microphone"
                  width={28}
                  height={28}
                  className={`object-contain transition-all duration-300 ${isListening ? "brightness-125 saturate-150 animate-bounce" : "hover:brightness-125"
                    }`}
                />
              </div>
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
      </footer>

      {/* Futuristic Chat History Slide-over Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l p-5 overflow-hidden transition-all transform duration-300 ${theme === "dark"
                ? "bg-[#0f172a]/95 border-slate-700/80 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
              }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Saved Chat History</h3>
                  <p className="text-xs text-slate-400 font-mono">Stored in MongoDB Atlas</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={fetchingHistory || historyMessages.length === 0}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${theme === "dark"
                      ? "bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/60"
                      : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Clear all history from MongoDB"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={fetchChatHistory}
                  disabled={fetchingHistory}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${theme === "dark"
                      ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-600"
                    }`}
                  title="Reload history from MongoDB"
                >
                  <svg className={`w-4 h-4 ${fetchingHistory ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  title="Close History Panel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* History Messages List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
              {fetchingHistory ? (
                <div className="flex items-center justify-center py-12 text-slate-400 space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-mono">Loading from MongoDB...</span>
                </div>
              ) : historyError ? (
                <div className="text-center py-10 px-4 text-rose-400 text-xs font-mono bg-rose-950/20 rounded-2xl border border-rose-500/30">
                  <p className="font-bold text-sm mb-1">⚠️ Unable to Load History</p>
                  <p className="opacity-80 leading-relaxed">{historyError}</p>
                  <p className="text-[10px] opacity-60 mt-2">Please ensure MONGO_URI is added in your Vercel Environment Variables.</p>
                </div>
              ) : historyMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <p>No chat history found in database.</p>
                  <p className="text-xs mt-1 opacity-70">Start sending messages to build history!</p>
                </div>
              ) : (
                historyMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${msg.role === "user"
                        ? theme === "dark"
                          ? "bg-slate-800/80 border-slate-700/60 text-slate-100"
                          : "bg-indigo-50/80 border-indigo-100 text-slate-900"
                        : theme === "dark"
                          ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-100"
                          : "bg-white border-slate-200 text-slate-900 shadow-sm"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[10px] uppercase font-semibold">
                      <span className={msg.role === "user" ? "text-cyan-400" : "text-indigo-400"}>
                        {msg.role === "user" ? "👤 User" : "🤖 Pragya AI"}
                      </span>
                    </div>
                    <p className="line-clamp-4 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-700/40 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleLoadHistoryToChat}
                disabled={historyMessages.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Load into Active Chat
              </button>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-semibold hover:from-indigo-500 hover:to-cyan-500 transition shadow-md glow-cyan"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
