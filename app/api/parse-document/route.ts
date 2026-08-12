import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      extractedText = data.text || "";
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".csv") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
      extractedText = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) {
      // Basic text extraction for PPTX XML slides if needed, or text fallback
      const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 500000));
      // Extract printable text chunks from slide XMLs inside zip stream
      const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, " ");
      const words = printable.split(/\s+/).filter(w => w.length > 2);
      extractedText = words.join(" ");
    } else {
      // Fallback try text read
      extractedText = buffer.toString("utf-8");
    }

    // Clean up excessive whitespace
    extractedText = extractedText.replace(/\s+/g, " ").trim();

    if (!extractedText) {
      return NextResponse.json({ error: "Could not extract readable text from this file." }, { status: 400 });
    }

    // Limit text length to prevent context overflow (e.g. ~100k characters)
    const truncatedText = extractedText.slice(0, 100000);

    return NextResponse.json({
      fileName: file.name,
      fileType: file.type || fileName.split(".").pop(),
      text: truncatedText,
      characterCount: truncatedText.length
    });
  } catch (err: any) {
    console.error("File parse error:", err);
    return NextResponse.json({ error: `Failed to parse file: ${err?.message || "Unknown error"}` }, { status: 500 });
  }
}
