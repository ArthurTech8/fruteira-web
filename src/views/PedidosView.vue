<script setup lang="ts">
import { computed, ref } from 'vue'
import { totalPedido, usePedidosStore } from '../stores/pedidos'
import { useClientesStore } from '../stores/clientes'
import { useLoad } from '../composables/useLoad'
import { chaveDia, dataHora, moeda, numero } from '../composables/useFormat'
import type { Pedido } from '../types/models'
import DataTable, { type Column } from '../components/ui/DataTable.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import LoadError from '../components/ui/LoadError.vue'

const pedidos = usePedidosStore()
const clientes = useClientesStore()
const { error, reload } = useLoad((force) => Promise.all([pedidos.load(force), clientes.load(force)]))

const busca = ref('')
const clienteFiltro = ref<number | null>(null)
const statusFiltro = ref<'concluido' | 'cancelado' | null>(null)
const de = ref('')
const ate = ref('')

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return pedidos.items.filter((p) => {
    const dia = chaveDia(p.dataPedido)
    if (de.value && dia < de.value) return false
    if (ate.value && dia > ate.value) return false
    if (clienteFiltro.value && p.clienteId !== clienteFiltro.value) return false
    if (statusFiltro.value === 'concluido' && !p.status) return false
    if (statusFiltro.value === 'cancelado' && p.status) return false
    if (termo && !(p.produto?.nome.toLowerCase().includes(termo) || String(p.id) === termo.replace('#', ''))) return false
    return true
  })
})

const resumo = computed(() => {
  const ok = filtrados.value.filter((p) => p.status)
  return {
    qtd: ok.length,
    total: ok.reduce((s, p) => s + totalPedido(p), 0),
    itens: ok.reduce((s, p) => s + p.quantidade, 0),
  }
})

const temFiltro = computed(() => !!(busca.value || clienteFiltro.value || statusFiltro.value || de.value || ate.value))
function limpar() {
  busca.value = ''
  clienteFiltro.value = null
  statusFiltro.value = null
  de.value = ''
  ate.value = ''
}

const columns: Column<Pedido>[] = [
  { key: 'id', label: 'Nº', sortBy: (p) => p.id, width: '70px' },
  { key: 'dataPedido', label: 'Data', sortBy: (p) => p.dataPedido },
  { key: 'cliente', label: 'Cliente', sortBy: (p) => p.cliente?.nome ?? '' },
  { key: 'produto', label: 'Produto', sortBy: (p) => p.produto?.nome ?? '' },
  { key: 'quantidade', label: 'Qtd', align: 'right', sortBy: (p) => p.quantidade },
  { key: 'precoUnitario', label: 'Preço unit.', align: 'right', sortBy: (p) => p.precoUnitario },
  { key: 'total', label: 'Total', align: 'right', sortBy: totalPedido },
  { key: 'status', label: 'Status', sortBy: (p) => (p.status ? 0 : 1) },
]
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Pedidos</h2>
        <p>
          {{ numero(resumo.qtd) }} vendas concluídas · {{ numero(resumo.itens) }} itens ·
          <strong>{{ moeda(resumo.total) }}</strong>
          <span v-if="temFiltro"> (filtrado)</span>
        </p>
      </div>
      <div class="actions">
        <BaseButton variant="secondary" icon="refresh" :loading="pedidos.loading" @click="reload">Atualizar</BaseButton>
        <BaseButton icon="cart" @click="$router.push('/pedidos/novo')">Nova venda</BaseButton>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />

    <div v-else class="card">
      <div class="toolbar">
        <BaseInput v-model="busca" class="grow" icon="search" placeholder="Produto ou nº do pedido…" />
        <BaseSelect
          v-model="clienteFiltro"
          placeholder="Todos os clientes"
          :options="clientes.items.map((c) => ({ value: c.id, label: c.nome }))"
        />
        <BaseSelect
          v-model="statusFiltro"
          placeholder="Todos os status"
          :options="[
            { value: 'concluido', label: 'Concluídos' },
            { value: 'cancelado', label: 'Cancelados' },
          ]"
        />
        <BaseInput v-model="de" class="date" type="date" aria-label="Data inicial" title="Data inicial" />
        <BaseInput v-model="ate" class="date" type="date" aria-label="Data final" title="Data final" />
        <BaseButton v-if="temFiltro" variant="ghost" icon="close" @click="limpar">Limpar</BaseButton>
      </div>
      <DataTable
        :columns="columns"
        :rows="filtrados"
        :loading="pedidos.loading && !pedidos.loaded"
        :initial-sort="{ key: 'dataPedido', dir: 'desc' }"
        empty-text="Nenhum pedido encontrado."
      >
        <template #id="{ row }"><span class="muted">#{{ row.id }}</span></template>
        <template #dataPedido="{ row }">{{ dataHora(row.dataPedido) }}</template>
        <template #cliente="{ row }">
          <RouterLink :to="`/clientes/${row.clienteId}`">{{ row.cliente?.nome ?? `#${row.clienteId}` }}</RouterLink>
        </template>
        <template #produto="{ row }">
          <span class="strong">{{ row.produto?.nome ?? '—' }}</span>
          <small class="muted cat">{{ row.produto?.categoria?.nome }}</small>
        </template>
        <template #precoUnitario="{ row }">{{ moeda(row.precoUnitario) }}</template>
        <template #total="{ row }"><span class="strong">{{ moeda(totalPedido(row)) }}</span></template>
        <template #status="{ row }">
          <StatusBadge :tone="row.status ? 'success' : 'danger'">{{ row.status ? 'Concluído' : 'Cancelado' }}</StatusBadge>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.cat {
  display: block;
  font-size: 12px;
}
.toolbar > * {
  flex: 0 1 170px;
}
.toolbar > .date {
  flex: 0 1 150px;
}
.toolbar > .grow {
  flex: 1 1 200px;
}
</style>
