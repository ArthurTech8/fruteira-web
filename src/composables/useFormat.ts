const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numeroFmt = new Intl.NumberFormat('pt-BR')
const dataFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dataHoraFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

export const moeda = (v: number) => moedaFmt.format(v)
export const numero = (v: number) => numeroFmt.format(v)

// dataPedido vem sem fuso; new Date() interpreta como horário local, que é o esperado
export const data = (iso: string | Date) => dataFmt.format(new Date(iso))
export const dataHora = (iso: string | Date) => dataHoraFmt.format(new Date(iso))

export const somenteDigitos = (v: string | null | undefined) => (v ?? '').replace(/\D/g, '')

export function cpf(v: string | null | undefined) {
  const d = somenteDigitos(v)
  if (d.length !== 11) return v || '—'
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function telefone(v: string | null | undefined) {
  const d = somenteDigitos(v)
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  if (d.length === 9) return d.replace(/(\d{5})(\d{4})/, '$1-$2')
  return v || '—'
}

/** Chave yyyy-mm-dd no horário local, usada para agrupar vendas por dia */
export function chaveDia(d: string | Date) {
  const dt = new Date(d)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${mm}-${dd}`
}

/** Lista de chaves de dia de `inicio` até `fim` (inclusive) */
export function diasEntre(inicio: Date, fim: Date) {
  const dias: string[] = []
  const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
  while (d <= fim) {
    dias.push(chaveDia(d))
    d.setDate(d.getDate() + 1)
  }
  return dias
}

export const rotuloDia = (chave: string) => {
  const [, m, d] = chave.split('-')
  return `${d}/${m}`
}
