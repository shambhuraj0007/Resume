// route.ts
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  throw new Error(
    "OPENROUTER_API_KEY is not defined in environment variables"
  );
}

// Define the expected OpenRouter response type
interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterChoice {
  message: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

export async function POST(req: Request) {
  try {
    const { description }: { description: string } = await req.json();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    };

    if (process.env.NEXT_PUBLIC_URL) {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_URL;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional resume writer. Rewrite user-provided descriptions into highly impactful, professional, and truthful resume objectives.",
          },
          {
            role: "user",
            content: `
Rewrite this into a polished resume objective (strictly under 450 characters):
Description: ${description}
- Clear, impactful, achievement-oriented
- Professional tone with strong action words
- No extra explanations
`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();

    const enhanced = data.choices?.[0]?.message?.content;

    if (!enhanced) {
      throw new Error("Invalid response format from OpenRouter API");
    }

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("Error in enhance API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enhance description" },
      { status: 500 }
    );
  }
}
