import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'
const KEY = 'fruteira:tema'

function initial(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignora */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(initial())

watch(
  theme,
  (t) => {
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* ignora */
    }
  },
  { immediate: true },
)

export function useTheme() {
  const toggle = () => (theme.value = theme.value === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
