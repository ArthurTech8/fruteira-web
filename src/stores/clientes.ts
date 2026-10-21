import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clientesApi } from '../services/api'
import type { Cliente, ClienteInput } from '../types/models'

export const useClientesStore = defineStore('clientes', () => {
  const items = ref<Cliente[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const ativos = computed(() => items.value.filter((c) => c.status))

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      items.value = await clientesApi.list()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function create(data: ClienteInput) {
    await clientesApi.create(data)
    await load(true)
  }

  async function update(id: number, data: ClienteInput) {
    await clientesApi.update(id, data)
    items.value = items.value.map((c) => (c.id === id ? { ...c, ...data } : c))
  }

  /**
   * Clientes nunca são apagados pelo site: o DELETE da API apaga de vez quem
   * não tem pedidos, então a inativação é feita via PUT com status = false,
   * preservando o cadastro e o histórico.
   */
  async function setStatus(id: number, status: boolean) {
    const cliente = byId(id)
    if (!cliente) return
    await update(id, { nome: cliente.nome, cpf: cliente.cpf, telefone: cliente.telefone, status })
  }

  const inativar = (id: number) => setStatus(id, false)
  const reativar = (id: number) => setStatus(id, true)

  const byId = (id: number) => items.value.find((c) => c.id === id)

  return { items, ativos, loading, loaded, load, create, update, inativar, reativar, byId }
})
