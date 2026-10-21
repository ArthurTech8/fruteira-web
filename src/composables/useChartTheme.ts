import { computed } from 'vue'
import { Chart, ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'
import { useTheme } from './useTheme'
import { moeda } from './useFormat'

Chart.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)
Chart.defaults.font.family = 'Inter, system-ui, sans-serif'

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** Cores dos gráficos lidas dos tokens CSS; recalcula quando o tema muda. */
export function useChartTheme() {
  const { theme } = useTheme()
  return computed(() => {
    // depende do tema para reler as variáveis CSS
    const key = theme.value
    return {
      key,
      text: css('--text-muted'),
      grid: css('--border'),
      surface: css('--surface'),
      primary: css('--primary'),
      primarySoft: css('--primary-soft'),
      series: [1, 2, 3, 4, 5, 6].map((i) => css(`--series-${i}`)),
    }
  })
}

export const moedaTick = (v: string | number) => moeda(Number(v)).replace(',00', '')
