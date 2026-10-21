import { reactive } from 'vue'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

/** Estado da conexão com a API, exibido na topbar. null = ainda não verificado. */
export const apiStatus = reactive<{ online: boolean | null }>({ online: null })

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

// A API devolve erros como texto puro (BadRequest("...")) ou como
// ProblemDetails quando a validação de DataAnnotations falha.
function extractMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    const p = payload as { title?: string; errors?: Record<string, string[]> }
    if (p.errors) {
      const msgs = Object.values(p.errors).flat()
      if (msgs.length) return msgs.join(' ')
    }
    if (p.title) return p.title
  }
  if (status === 404) return 'Registro não encontrado.'
  return `Erro ${status} ao comunicar com a API.`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(BASE_URL + path, window.location.origin)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    apiStatus.online = false
    throw new ApiError('Não foi possível conectar à API. Verifique se o Projeto-Fruteira está rodando.', 0)
  }

  // O proxy do Vite responde 502/504 quando a API está fora do ar
  if (response.status === 502 || response.status === 504) {
    apiStatus.online = false
    throw new ApiError('A API do Projeto-Fruteira não está respondendo.', response.status)
  }
  apiStatus.online = true

  const isJson = response.headers.get('content-type')?.includes('json')
  const payload: unknown = response.status === 204 ? undefined : isJson ? await response.json() : await response.text()

  if (!response.ok) throw new ApiError(extractMessage(payload, response.status), response.status)
  return payload as T
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.'
}
