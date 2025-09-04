// route.ts
import { NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const API_URL = "https://openrouter.ai/api/v1/chat/completions"

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not defined in environment variables')
}

export async function POST(req: Request) {
  try {
    const { description } = await req.json()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    }

    // Only add HTTP-Referer if NEXT_PUBLIC_URL is defined
    if (process.env.NEXT_PUBLIC_URL) {
      headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_URL
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
     body: JSON.stringify({
  model: "openai/gpt-3.5-turbo", // Or any valid OpenRouter model
  messages: [
    {
      role: "system",
      content: "You are a professional resume writer. Your task is to rewrite user-provided descriptions into highly impactful, professional, and truthful resume objectives."
    },
    {
      role: "user",
      content: `
      dont use special characters like ** or - or ....ever.
Rewrite this into a polished **resume objective**. 
- Make it clear, impactful, and achievement-oriented.  
- Use professional tone and strong action words.  
- Use only **bold** for emphasis and "-" for bullet points if absolutely necessary.  
- Do not add phrases like 'here are' or explanations.  
- Keep it strictly under 450 characters.  

Description: ${description}
      `
    }
  ]
})


    })

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenRouter API')
    }

    return NextResponse.json({ 
      enhanced: data.choices[0].message.content 
    })
  } catch (error) {
    console.error('Error in enhance API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance description' },
      { status: 500 }
    )
  }
}