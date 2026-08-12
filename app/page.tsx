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
    placeholder: "Ask Cognito anything...",
    listeningText: "Listening to your voice...",
    subtext: "Type or tap the microphone inside the search bar to speak directly to Cognito AI.",
  },
  {
    code: "bn-IN",
    countryCode: "in",
    name: "Bengali",
    nativeName: "বাংলা",
    placeholder: "কগনিটোকে যেকোনো কিছু জিজ্ঞাসা করুন...",
    listeningText: "আপনার কথা শুনছি... এখন বলুন!",
    subtext: "কগনিটোর সাথে কথা বলতে টাইপ করুন অথবা সার্চ বারের মাইক্রোফোনে আলতো চাপুন।",
  },
  {
    code: "hi-IN",
    countryCode: "in",
    name: "Hindi",
    nativeName: "हिन्दी",
    placeholder: "कॉग्निटो से कुछ भी पूछें...",
    listeningText: "आपकी आवाज़ सुन रहे हैं... अब बोलें!",
    subtext: "कॉग्निटो एआई से बात करने के लिए टाइप करें या सर्च बार में माइक्रोफ़ोन पर टैप करें।",
  },
  {
    code: "es-ES",
    countryCode: "es",
    name: "Spanish",
    nativeName: "Español",
    placeholder: "Pregúntale a Cognito lo que sea...",
    listeningText: "Escuchando tu voz... ¡Habla ahora!",
    subtext: "Escribe o toca el micrófono en la barra de búsqueda para hablar con Cognito AI.",
  },
  {
    code: "fr-FR",
    countryCode: "fr",
    name: "French",
    nativeName: "Français",
    placeholder: "Demandez n'importe quoi à Cognito...",
    listeningText: "À l'écoute de votre voix... Parlez maintenant!",
    subtext: "Tapez ou appuyez sur le microphone dans la barre de recherche pour parler à Cognito AI.",
  },
  {
    code: "de-DE",
    countryCode: "de",
    name: "German",
    nativeName: "Deutsch",
    placeholder: "Fragen Sie Cognito etwas...",
    listeningText: "Höre deiner Stimme zu... Sprich jetzt!",
    subtext: "Geben Sie Ihren Text ein oder tippen Sie auf das Mikrofon, um mit Cognito AI zu sprechen.",
  },
  {
    code: "ja-JP",
    countryCode: "jp",
    name: "Japanese",
    nativeName: "日本語",
    placeholder: "Cognitoに何でも質問してください...",
    listeningText: "音声を聞き取っています... 今すぐ話し始めてください！",
    subtext: "Cognito AIと会話するには、メッセージを入力するかマイクをタップしてください。",
  },
  {
    code: "zh-CN",
    countryCode: "cn",
    name: "Chinese",
    nativeName: "中文",
    placeholder: "向 Cognito 提问任何问题...",
    listeningText: "正在聆听您的声音... 请说话！",
    subtext: "输入文字或点击搜索栏中的麦克风直接与 Cognito AI 交谈。",
  },
  {
    code: "ar-SA",
    countryCode: "sa",
    name: "Arabic",
    nativeName: "العربية",
    placeholder: "اسأل كوغنيتو أي شيء...",
    listeningText: "جاري الاستماع إلى صوتك... تحدث الآن!",
    subtext: "اكتب أو انقر على الميكروفون في شريط البحث للتحدث مباشرة إلى Cognito AI.",
  },
  {
    code: "ru-RU",
    countryCode: "ru",
    name: "Russian",
    nativeName: "Русский",
    placeholder: "Спросите Cognito о чем угодно...",
    listeningText: "Слушаю ваш голос... Говорите!",
    subtext: "Введите текст или нажмите на микрофон в строке поиска, чтобы поговорить с Cognito AI.",
  },
  {
    code: "pt-BR",
    countryCode: "br",
    name: "Portuguese",
    nativeName: "Português",
    placeholder: "Pergunte qualquer coisa ao Cognito...",
    listeningText: "Ouvindo sua voz... Fale agora!",
    subtext: "Digite ou toque no microfone na barra de pesquisa para falar com Cognito AI.",
  },
  {
    code: "it-IT",
    countryCode: "it",
    name: "Italian",
    nativeName: "Italiano",
    placeholder: "Chiedi qualsiasi cosa a Cognito...",
    listeningText: "Ascoltando la tua voce... Parla ora!",
    subtext: "Scrivi o tocca il microfono nella barra di ricerca per parlare con Cognito AI.",
  },
  {
    code: "ko-KR",
    countryCode: "kr",
    name: "Korean",
    nativeName: "한국어",
    placeholder: "Cognito에게 무엇이든 물어보세요...",
    listeningText: "음성을 듣고 있습니다... 지금 말씀하세요!",
    subtext: "Cognito AI와 대화하려면 메시지를 입력하거나 마이크를 탭하세요.",
  },
  {
    code: "tr-TR",
    countryCode: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    placeholder: "Cognito'ya her şeyi sorun...",
    listeningText: "Sesiniz dinleniyor... Şimdi konuşun!",
    subtext: "Cognito AI ile konuşmak için yazın veya arama çubuğundaki mikrofona dokunun.",
  },
  {
    code: "ta-IN",
    countryCode: "in",
    name: "Tamil",
    nativeName: "தமிழ்",
    placeholder: "கோக்னிட்டோவிடம் எதுவாக இருந்தாலும் கேளுங்கள்...",
    listeningText: "உங்கள் குரலைக் கேட்கிறது... இப்போது பேசுங்கள்!",
    subtext: "கோக்னிட்டோ AI உடன் பேச தட்டச்சு செய்யவும் அல்லது மைக்ரோஃபோனைத் தொடவும்.",
  },
  {
    code: "te-IN",
    countryCode: "in",
    name: "Telugu",
    nativeName: "తెలుగు",
    placeholder: "కోగ్నిటోను ఏదైనా అడగండి...",
    listeningText: "మీ వాయిస్ వింటోంది... ఇప్పుడు మాట్లాడండి!",
    subtext: "కోగ్నిటో AIతో మాట్లాడటానికి టైప్ చేయండి లేదా మైక్రోఫోన్‌ను నొక్కండి.",
  },
  {
    code: "mr-IN",
    countryCode: "in",
    name: "Marathi",
    nativeName: "मराठी",
    placeholder: "कॉग्निटोला काहीही विचारा...",
    listeningText: "तुमचा आवाज ऐकत आहे... आता बोला!",
    subtext: "कॉग्निटो AI शी बोलण्यासाठी टाईप करा किंवा मायक्रोफोनवर टॅप करा.",
  },
  {
    code: "gu-IN",
    countryCode: "in",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    placeholder: "કોગ્નિટોને કંઈપણ પૂછો...",
    listeningText: "તમારો અવાજ સાંભળી રહ્યા છીએ... હવે બોલો!",
    subtext: "કોગ્નિટો AI સાથે વાત કરવા માટે ટાઇપ કરો અથવા માઇક્રોફોન પર ટેપ કરો.",
  },
  {
    code: "kn-IN",
    countryCode: "in",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    placeholder: "ಕಾಗ್ನಿಟೋಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...",
    listeningText: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಕೇಳಲಾಗುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ!",
    subtext: "ಕಾಗ್ನಿಟೋ AI ನೊಂದಿಗೆ ಮಾತನಾಡಲು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ರೊಫೋನ್ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.",
  },
  {
    code: "ml-IN",
    countryCode: "in",
    name: "Malayalam",
    nativeName: "മലയാളം",
    placeholder: "കോഗ്നിറ്റോയോട് എന്ത് വേണമെങ്കിലും ചോദിക്കൂ...",
    listeningText: "നിങ്ങളുടെ ശബ്ദം കേൾക്കുന്നു... ഇപ്പോൾ സംസാരിക്കൂ!",
    subtext: "കോഗ്നിറ്റോ AI-യുമായി സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക.",
  },
  {
    code: "id-ID",
    countryCode: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    placeholder: "Tanyakan apa saja kepada Cognito...",
    listeningText: "Mendengarkan suara Anda... Bicara sekarang!",
    subtext: "Ketik atau ketuk mikrofon di bilah pencarian untuk berbicara dengan Cognito AI.",
  },
  {
    code: "vi-VN",
    countryCode: "vn",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    placeholder: "Hỏi Cognito bất cứ điều gì...",
    listeningText: "Đang lắng nghe giọng nói của bạn... Hãy nói ngay!",
    subtext: "Nhập hoặc chạm vào micro trong thanh tìm kiếm để trò chuyện với Cognito AI.",
  },
  {
    code: "nl-NL",
    countryCode: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    placeholder: "Vraag Cognito van alles...",
    listeningText: "Luisteren naar je stem... Spreek nu!",
    subtext: "Typ of tik op de microfoon in de zoekbalk om met Cognito AI te spreken.",
  },
  {
    code: "pl-PL",
    countryCode: "pl",
    name: "Polish",
    nativeName: "Polski",
    placeholder: "Zapytaj Cognito o cokolwiek...",
    listeningText: "Słucham Twojego głosu... Mów teraz!",
    subtext: "Wpisz lub dotknij mikrofonu w pasku wyszukiwania, aby porozmawiać z Cognito AI.",
  },
  {
    code: "th-TH",
    countryCode: "th",
    name: "Thai",
    nativeName: "ไทย",
    placeholder: "ถามอะไรก็ได้กับ Cognito...",
    listeningText: "กำลังฟังเสียงของคุณ... พูดได้เลย!",
    subtext: "พิมพ์หรือแตะไมโครโฟนในแถบค้นหาเพื่อพูดคุยกับ Cognito AI",
  },
];

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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

  const currentLang =
    LANGUAGES.find((l) => l.code === selectedLangCode) || LANGUAGES[0];

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Close custom dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = selectedLangCode.split("-")[0];
    const matchingVoice =
      voices.find((v) => v.lang === selectedLangCode) ||
      voices.find((v) => v.lang.startsWith(langPrefix));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
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
        body: JSON.stringify({
          messages: newMessages,
          language: currentLang.name,
        }),
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

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* CUSTOM FUTURISTIC LANGUAGE SELECTOR WITH REAL NATIONAL FLAG IMAGES */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 outline-none ${
                theme === "dark"
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
                className={`absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-2xl z-50 backdrop-blur-xl border scrollbar-thin ${
                  theme === "dark"
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isSelected
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
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
              theme === "dark"
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

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
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
                {currentLang.subtext}
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
                            isSpeaking
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
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="relative w-full group">
            {/* Glowing ring under focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full blur-md opacity-35 group-hover:opacity-75 group-focus-within:opacity-100 transition duration-300" />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? currentLang.listeningText : currentLang.placeholder}
              disabled={loading}
              className={`relative w-full py-4 pl-6 pr-28 rounded-full text-sm font-normal transition-all duration-300 outline-none backdrop-blur-xl ${
                theme === "dark"
                  ? "bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:bg-slate-900 shadow-2xl"
                  : "bg-white border border-slate-300/90 text-slate-900 placeholder-slate-500 focus:border-indigo-600 shadow-xl"
              }`}
            />

            {/* Voice Assistant Futuristic Glowing Microphone Graphic Button inside Search Bar */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full p-1 border transition-all duration-300 flex items-center justify-center ${
                isListening
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
                  className={`object-contain transition-all duration-300 ${
                    isListening ? "brightness-125 saturate-150 animate-bounce" : "hover:brightness-125"
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
        <div className={`mt-2 text-center text-[11px] font-mono flex items-center justify-center space-x-2 ${
          theme === "dark" ? "text-slate-400" : "text-slate-600 font-medium"
        }`}>
          <span>Cognito Voice Assistant</span>
          <span>•</span>
          <div className="inline-flex items-center space-x-1">
            <img
              src={`https://flagcdn.com/w40/${currentLang.countryCode}.png`}
              alt={currentLang.name}
              className="w-4 h-3 object-cover rounded-sm border border-slate-500/40 inline-block"
            />
            <span>{currentLang.nativeName} ({currentLang.code})</span>
          </div>
          <span>•</span>
          <span>Web Speech Engine Active</span>
        </div>
      </footer>
    </div>
  );
}