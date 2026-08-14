import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Chat from "../../../models/chat";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "⚠️ GEMINI_API_KEY is not configured in Vercel Environment Variables. Please set GEMINI_API_KEY in your Vercel Project Settings."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { messages, language, sessionId, title } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "Please provide a valid message." }, { status: 400 });
    }

    const currentSessionId = sessionId || `session_${Date.now()}`;
    const firstUserMsg = messages.find((m: any) => m.role === "user")?.content || "New Chat";
    const sessionTitle = title || (firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + "..." : firstUserMsg);

    const systemInstruction = language
      ? `You are Pragya (প্রজ্ঞা / প্রज्ञा), an advanced futuristic AI assistant. The user's preferred language is ${language}. Respond primarily in ${language} (or in the language the user speaks to you), while keeping responses helpful, intelligent, and formatted cleanly. If the user asks about storing, saving, or finding chat history, inform them that all conversation history is automatically saved and can be found anytime in the History section (top button or left sidebar). If the user has attached document content (PDF/DOC/PPT/Text), answer their questions specifically based on the provided document text accurately. IMPORTANT: Whenever the user asks who created, invented, developed, or made you (or Pragya, Incognito, Cognito, or this AI), state in ${language}: "I was created by Arpan Basak, a passionate Software Engineer, AI enthusiast, and technology builder from Kolkata, West Bengal, India." (Translate this creator statement accurately into ${language}).`
      : 'You are Pragya (প্রজ্ঞা / প্রज्ञा), an advanced futuristic AI assistant. If the user asks about storing, saving, or finding chat history, inform them that all conversation history is automatically saved and can be found anytime in the History section (top button or left sidebar). If the user has attached document content (PDF/DOC/PPT/Text), answer their questions specifically based on the provided document text accurately. Whenever the user asks who created, invented, developed, or made you (or Pragya, Incognito, Cognito, or this AI), state: "I was created by Arpan Basak, a passionate Software Engineer, AI enthusiast, and technology builder from Kolkata, West Bengal, India." Respond helpfully and intelligently.';

    const MODELS_TO_TRY = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.6-flash"];
    let generativeModel: any = null;
    let chatSession: any = null;
    let resultStream: any = null;
    let lastError: any = null;

    // Limit conversation history overhead to last 11 messages max
    const recentMessages = messages.slice(-11);
    const history = recentMessages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));
    const lastMessage = recentMessages[recentMessages.length - 1]?.content || "";

    // Try models in order of priority (fallback if 429 or quota limit hit)
    for (const modelName of MODELS_TO_TRY) {
      try {
        generativeModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });
        chatSession = generativeModel.startChat({ history });
        resultStream = await chatSession.sendMessageStream(lastMessage);
        if (resultStream) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying fallback:`, err?.message);
        lastError = err;
      }
    }

    if (!resultStream) {
      throw lastError || new Error("All Gemini AI model endpoints are currently overloaded or rate limited.");
    }

    let fullReply = "";
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            fullReply += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (streamError) {
          console.error("Stream generation error:", streamError);
        } finally {
          controller.close();
          // Asynchronously save to MongoDB with sessionId and title
          if (fullReply.trim()) {
            (async () => {
              try {
                const conn = await connectDB();
                if (conn) {
                  await Chat.insertMany([
                    { role: "user", content: lastMessage, sessionId: currentSessionId, title: sessionTitle },
                    { role: "assistant", content: fullReply, sessionId: currentSessionId, title: sessionTitle },
                  ]);
                }
              } catch (dbErr) {
                console.error("MongoDB background save error:", dbErr);
              }
            })();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Session-Id": currentSessionId,
      },
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const isRateLimit = error?.message?.includes("429") || error?.message?.includes("Quota");
    const userFriendlyMessage = isRateLimit
      ? "⏳ Google Gemini API free-tier quota limit reached (429 Too Many Requests). Please wait 30 seconds before sending your next message."
      : `⚠️ AI Model Error: ${error?.message || "Failed to generate response."}`;

    return NextResponse.json({ reply: userFriendlyMessage }, { status: isRateLimit ? 429 : 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.warn("MongoDB connection unavailable for GET /api/chat");
      return NextResponse.json({ messages: [], sessions: [], error: "MongoDB URI not configured" });
    }

    const { searchParams } = new URL(req.url);
    const requestedSessionId = searchParams.get("sessionId");

    if (requestedSessionId) {
      // Fetch messages for a specific session
      const messages = await Chat.find({ sessionId: requestedSessionId }).sort({ createdAt: 1 }).lean();
      return NextResponse.json({ messages });
    }

    // Group all chats by sessionId to generate recent sessions list for ChatGPT-style sidebar
    const allChats = await Chat.find({}).sort({ updatedAt: -1 }).lean();
    const sessionMap = new Map<string, { sessionId: string; title: string; updatedAt: Date; lastMessage: string }>();

    for (const chat of allChats) {
      const sid = chat.sessionId || "default_session";
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          sessionId: sid,
          title: chat.title || (chat.content ? (chat.content.length > 30 ? chat.content.substring(0, 30) + "..." : chat.content) : "Chat Session"),
          updatedAt: chat.updatedAt || new Date(),
          lastMessage: chat.content || "",
        });
      }
    }

    const sessions = Array.from(sessionMap.values());
    return NextResponse.json({ messages: allChats, sessions });
  } catch (error: any) {
    console.error("MongoDB load error:", error);
    return NextResponse.json({ messages: [], sessions: [], error: error?.message || "Failed to query database" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ error: "MongoDB connection unavailable" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const requestedSessionId = searchParams.get("sessionId");

    if (requestedSessionId) {
      await Chat.deleteMany({ sessionId: requestedSessionId });
      return NextResponse.json({ message: `Session ${requestedSessionId} deleted successfully` });
    }

    await Chat.deleteMany({});
    return NextResponse.json({ message: "All history deleted successfully" });
  } catch (error: any) {
    console.error("MongoDB delete error:", error);
    return NextResponse.json({ error: "Failed to delete chat history" }, { status: 500 });
  }
}