import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { pedidosApi } from '../services/api'
import type { Pedido, PedidoCreateDto } from '../types/models'
import { useProdutosStore } from './produtos'

export const totalPedido = (p: Pedido) => p.quantidade * p.precoUnitario

export const usePedidosStore = defineStore('pedidos', () => {
  const items = ref<Pedido[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  /** Pedidos concluídos, os únicos que contam como venda */
  const concluidos = computed(() => items.value.filter((p) => p.status))

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      items.value = (await pedidosApi.list()).sort((a, b) => b.dataPedido.localeCompare(a.dataPedido))
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  // A API baixa o estoque ao registrar o pedido, então recarrega os produtos também
  async function create(data: PedidoCreateDto) {
    const pedido = await pedidosApi.create(data)
    await Promise.all([load(true), useProdutosStore().load(true)])
    return pedido
  }

  return { items, concluidos, loading, loaded, load, create }
})
