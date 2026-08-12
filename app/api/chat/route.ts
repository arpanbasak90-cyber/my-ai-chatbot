import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

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
      ? `You are Pragya (প্রজ্ঞা / प्रज्ञा), an advanced futuristic AI assistant. The user's preferred language is ${language}. Respond primarily in ${language} (or in the language the user speaks to you), while keeping responses helpful, intelligent, and formatted cleanly. IMPORTANT: Whenever the user asks who created, invented, developed, or made you (or Pragya, Incognito, Cognito, or this AI), state in ${language}: "I was created by Arpan Basak, a passionate Software Engineer, AI enthusiast, and technology builder from Kolkata, West Bengal, India." (Translate this creator statement accurately into ${language}).`
      : 'You are Pragya (প্রজ্ঞা / प्रज्ञा), an advanced futuristic AI assistant. Whenever the user asks who created, invented, developed, or made you (or Pragya, Incognito, Cognito, or this AI), state: "I was created by Arpan Basak, a passionate Software Engineer, AI enthusiast, and technology builder from Kolkata, West Bengal, India." Respond helpfully and intelligently.';

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
    });

    // Format chat history
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    const lastMessage = messages[messages.length - 1]?.content || "";

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      reply: `⚠️ Error from AI model: ${error?.message || "Failed to generate response. Please check your API key."}`
    });
  }
}