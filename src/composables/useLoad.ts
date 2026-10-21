import { onMounted, ref } from 'vue'
import { errorMessage } from '../services/http'

/**
 * Executa as cargas da tela ao montar e guarda o erro para exibir na página.
 * `reload` força nova busca na API.
 */
export function useLoad(loader: (force: boolean) => Promise<unknown>) {
  const error = ref<string | null>(null)
  const loading = ref(true)

  async function run(force = false) {
    loading.value = true
    error.value = null
    try {
      await loader(force)
    } catch (e) {
      error.value = errorMessage(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => run())
  return { error, loading, reload: () => run(true) }
}
