import { ref, watch } from 'vue'

const KEY = 'fruteira:limite-estoque'

function read() {
  try {
    const v = Number(localStorage.getItem(KEY))
    return Number.isFinite(v) && v > 0 ? v : 30
  } catch {
    return 30
  }
}

// Compartilhado entre Dashboard e Alerta de estoque
const limite = ref(read())
watch(limite, (v) => {
  try {
    localStorage.setItem(KEY, String(v))
  } catch {
    /* armazenamento indisponível: mantém só em memória */
  }
})

export function useStockThreshold() {
  return limite
}

export type NivelEstoque = 'zerado' | 'critico' | 'baixo' | 'ok'

export function nivelEstoque(qtd: number, lim: number): NivelEstoque {
  if (qtd <= 0) return 'zerado'
  if (qtd <= lim / 2) return 'critico'
  if (qtd <= lim) return 'baixo'
  return 'ok'
}

export const rotuloNivel: Record<NivelEstoque, string> = {
  zerado: 'Sem estoque',
  critico: 'Crítico',
  baixo: 'Baixo',
  ok: 'Normal',
}

export const tomNivel: Record<NivelEstoque, 'danger' | 'warning' | 'success'> = {
  zerado: 'danger',
  critico: 'danger',
  baixo: 'warning',
  ok: 'success',
}
