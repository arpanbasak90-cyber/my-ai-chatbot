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
    const { messages, language } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "Please provide a valid message." }, { status: 400 });
    }

    const systemInstruction = language
      ? `You are Pragya (প্রজ্ঞা / প্রज्ञा), an advanced futuristic AI assistant. The user's preferred language is ${language}. Respond primarily in ${language} (or in the language the user speaks to you), while keeping responses helpful, intelligent, and formatted cleanly. If the user has attached document content (PDF/DOC/PPT/Text), answer their questions specifically based on the provided document text accurately. IMPORTANT: Whenever the user asks who created, invented, developed, or made you (or Pragya, Incognito, Cognito, or this AI), state in ${language}: "I was created by Arpan Basak, a passionate Software Engineer, AI enthusiast, and technology builder from Kolkata, West Bengal, India." (Translate this creator statement accurately into ${language}).`
      : 'You are Pragya (প্রজ্ঞা / প্রज्ञा), an advanced futuristic AI assistant. If the user has attached document content (PDF/DOC/PPT/Text), answer their questions specifically based on the provided document text accurately. Whenever the user asks who created, invented, developed, or made you (or Pragya, Incognito, Cognito, or this AI), state: "I was created by Arpan Basak, a passionate Software Engineer, AI enthusiast, and technology builder from Kolkata, West Bengal, India." Respond helpfully and intelligently.';

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
    });

    // Limit conversation history overhead to last 10 messages max for maximum speed
    const recentMessages = messages.slice(-11);
    const history = recentMessages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    const lastMessage = recentMessages[recentMessages.length - 1]?.content || "";

    const chat = model.startChat({ history });
    const resultStream = await chat.sendMessageStream(lastMessage);

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
          // Asynchronously save to MongoDB without delaying response delivery
          if (fullReply.trim()) {
            (async () => {
              try {
                const conn = await connectDB();
                if (conn) {
                  await Chat.insertMany([
                    { role: "user", content: lastMessage },
                    { role: "assistant", content: fullReply },
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
      },
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      reply: `⚠️ Error from AI model: ${error?.message || "Failed to generate response. Please check your API key."}`
    });
  }
}

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.warn("MongoDB connection unavailable for GET /api/chat");
      return NextResponse.json({ messages: [], error: "MongoDB URI not configured or failed to connect" });
    }
    const chats = await Chat.find({}).sort({ createdAt: 1 }).limit(100).lean();
    return NextResponse.json({ messages: chats });
  } catch (error: any) {
    console.error("MongoDB load error:", error);
    return NextResponse.json({ messages: [], error: error?.message || "Failed to query database" });
  }
}

export async function DELETE() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ error: "MongoDB connection unavailable" }, { status: 500 });
    }
    await Chat.deleteMany({});
    return NextResponse.json({ message: "History deleted successfully" });
  } catch (error: any) {
    console.error("MongoDB delete error:", error);
    return NextResponse.json({ error: "Failed to delete chat history" }, { status: 500 });
  }
}