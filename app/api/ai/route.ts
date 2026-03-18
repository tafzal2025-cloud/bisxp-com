import { NextResponse } from 'next/server'

export const maxDuration = 60

const rateLimit = new Map<string, number[]>()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const promptLength = JSON.stringify(body.messages).length
    if (promptLength > 50000) {
      return NextResponse.json({ error: 'Request too large' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const now = Date.now()
    const windowMs = 60 * 60 * 1000
    if (!rateLimit.has(ip)) rateLimit.set(ip, [])
    const requests = rateLimit.get(ip)!.filter(t => now - t < windowMs)
    if (requests.length >= 50) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    requests.push(now)
    rateLimit.set(ip, requests)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: body.messages,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json(
        { error: 'AI service error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (err) {
    console.error('AI proxy error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
