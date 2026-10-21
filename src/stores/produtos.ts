import { defineStore } from 'pinia'
import { ref } from 'vue'
import { produtosApi } from '../services/api'
import type { Produto, ProdutoInput } from '../types/models'
import { useCategoriasStore } from './categorias'

export const useProdutosStore = defineStore('produtos', () => {
  const items = ref<Produto[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      items.value = (await produtosApi.list()).sort((a, b) => a.nome.localeCompare(b.nome))
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function create(data: ProdutoInput) {
    await produtosApi.create(data)
    await load(true)
  }

  // PUT devolve 204, então atualiza localmente para não recarregar a lista inteira
  async function update(id: number, data: ProdutoInput) {
    await produtosApi.update(id, data)
    const categoria = useCategoriasStore().byId(data.categoriaId) ?? null
    items.value = items.value.map((p) => (p.id === id ? { ...p, ...data, categoria } : p))
  }

  async function remove(id: number) {
    await produtosApi.remove(id)
    items.value = items.value.filter((p) => p.id !== id)
  }

  const byId = (id: number) => items.value.find((p) => p.id === id)

  return { items, loading, loaded, load, create, update, remove, byId }
})
