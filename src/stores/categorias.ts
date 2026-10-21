import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriasApi } from '../services/api'
import type { Categoria } from '../types/models'

export const useCategoriasStore = defineStore('categorias', () => {
  const items = ref<Categoria[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      items.value = (await categoriasApi.list()).sort((a, b) => a.nome.localeCompare(b.nome))
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const byId = (id: number) => items.value.find((c) => c.id === id)

  return { items, loading, loaded, load, byId }
})
