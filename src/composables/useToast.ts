import { reactive } from 'vue'

export type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  tone: ToastTone
  message: string
}

const toasts = reactive<Toast[]>([])
let nextId = 1

function push(tone: ToastTone, message: string, timeout = 4500) {
  const id = nextId++
  toasts.push({ id, tone, message })
  setTimeout(() => dismiss(id), timeout)
}

function dismiss(id: number) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i >= 0) toasts.splice(i, 1)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m, 7000),
    info: (m: string) => push('info', m),
  }
}
