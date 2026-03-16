import { NextResponse } from 'next/server'
import { isOllamaAvailable, askOllama } from '@/lib/ollama'

export async function GET() {
  const availability = await isOllamaAvailable()
  if (!availability.ok) {
    return NextResponse.json(
      { ok: false, error: availability.error, step: 'availability_check' },
      { status: 503 }
    )
  }

  try {
    const response = await askOllama('Reply in exactly one short sentence: What is 2+2?')
    return NextResponse.json({
      ok: true,
      message: 'Ollama is working.',
      modelResponse: response.trim(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { ok: false, error: message, step: 'prompt' },
      { status: 502 }
    )
  }
}
