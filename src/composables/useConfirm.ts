import { reactive } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

const state = reactive({
  open: false,
  options: { title: '', message: '' } as ConfirmOptions,
  resolve: null as ((ok: boolean) => void) | null,
})

export function useConfirm() {
  function confirm(options: ConfirmOptions) {
    state.options = options
    state.open = true
    return new Promise<boolean>((resolve) => {
      state.resolve = resolve
    })
  }

  function answer(ok: boolean) {
    state.open = false
    state.resolve?.(ok)
    state.resolve = null
  }

  return { state, confirm, answer }
}
