import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

async function parsePPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const slideFiles: { num: number; path: string }[] = [];

    zip.forEach((relativePath) => {
      const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
      if (match) {
        slideFiles.push({ num: parseInt(match[1], 10), path: relativePath });
      }
    });

    slideFiles.sort((a, b) => a.num - b.num);

    const slideTexts: string[] = [];

    for (const slide of slideFiles) {
      const zipFile = zip.file(slide.path);
      if (!zipFile) continue;

      const xml = await zipFile.async("text");
      // Match text contents within drawing XML <a:t> elements
      const matches = xml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
      const text = matches
        .map((m) =>
          m
            .replace(/<[^>]+>/g, "")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .trim()
        )
        .filter((t) => t.length > 0)
        .join(" ");

      if (text) {
        slideTexts.push(`[Slide ${slide.num}]\n${text}`);
      }
    }

    if (slideTexts.length > 0) {
      return slideTexts.join("\n\n");
    }
  } catch (e) {
    console.error("PPTX JSZip parsing error:", e);
  }
  return "";
}

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
    } else if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) {
      extractedText = await parsePPTX(buffer);
      if (!extractedText) {
        // Fallback for older .ppt or non-standard PPTX files
        const textStr = buffer.toString("utf-8", 0, Math.min(buffer.length, 500000));
        const matches = textStr.match(/[\w\s.,?!'"():\-]{4,}/g) || [];
        extractedText = matches.join(" ");
      }
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".csv") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
      extractedText = buffer.toString("utf-8");
    } else {
      extractedText = buffer.toString("utf-8");
    }

    // Clean up excessive whitespace while preserving slide linebreaks
    extractedText = extractedText.replace(/[ \t]+/g, " ").trim();

    if (!extractedText) {
      return NextResponse.json({ error: "Could not extract readable text from this file." }, { status: 400 });
    }

    // Limit text length to prevent context overflow (~100k characters)
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

