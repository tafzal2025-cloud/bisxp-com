import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Accept either {messages} or full Anthropic payload shape
    // New demo suite sends: {model, max_tokens, system, messages}
    const {
      model = 'claude-sonnet-4-20250514',
      max_tokens = 1000,
      system,
      messages,
    } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages array required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Build Anthropic request — only include system if provided
    const anthropicBody: Record<string, unknown> = {
      model,
      max_tokens,
      messages,
    }
    if (system) {
      anthropicBody.system = system
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
