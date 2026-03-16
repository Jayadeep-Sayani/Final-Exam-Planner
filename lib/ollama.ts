const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'https://mlvoca.com'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'tinyllama'

const isLocalHost =
  OLLAMA_HOST.includes('localhost') || OLLAMA_HOST.includes('127.0.0.1')

export type OllamaOptions = {
  stream?: boolean
}

export async function askOllama(prompt: string, options?: OllamaOptions): Promise<string> {
  const url = `${OLLAMA_HOST.replace(/\/$/, '')}/api/generate`
  const body = {
    model: OLLAMA_MODEL,
    prompt,
    stream: options?.stream ?? false,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM request failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { response?: string; error?: string }
  if (data.error) {
    throw new Error(`LLM error: ${data.error}`)
  }
  return typeof data.response === 'string' ? data.response : ''
}

export async function isOllamaAvailable(): Promise<{ ok: boolean; error?: string }> {
  try {
    const baseUrl = OLLAMA_HOST.replace(/\/$/, '')
    if (!isLocalHost) {
      return { ok: true }
    }
    const listUrl = `${baseUrl}/api/tags`
    const listRes = await fetch(listUrl, { method: 'GET' })
    if (!listRes.ok) {
      return { ok: false, error: `Ollama not reachable (${listRes.status}). Is Ollama running?` }
    }
    const list = (await listRes.json()) as { models?: { name: string }[] }
    const models = list.models ?? []
    const hasModel = models.some((m) => m.name === OLLAMA_MODEL || m.name.startsWith(`${OLLAMA_MODEL}:`))
    if (!hasModel) {
      return { ok: false, error: `Model "${OLLAMA_MODEL}" not found. Run: ollama pull ${OLLAMA_MODEL}` }
    }
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `Check failed: ${message}` }
  }
}
