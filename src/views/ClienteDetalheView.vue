<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClientesStore } from '../stores/clientes'
import { totalPedido, usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { cpf, dataHora, moeda, numero, telefone } from '../composables/useFormat'
import type { Pedido } from '../types/models'
import DataTable, { type Column } from '../components/ui/DataTable.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import StatCard from '../components/ui/StatCard.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import LoadError from '../components/ui/LoadError.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import ClienteForm from '../components/clientes/ClienteForm.vue'

const props = defineProps<{ id: number }>()

const clientes = useClientesStore()
const pedidos = usePedidosStore()
const { error, loading, reload } = useLoad((force) => Promise.all([clientes.load(force), pedidos.load(force)]))

const cliente = computed(() => clientes.byId(props.id))
const historico = computed(() => pedidos.items.filter((p) => p.clienteId === props.id))
const concluidos = computed(() => historico.value.filter((p) => p.status))
const totalGasto = computed(() => concluidos.value.reduce((s, p) => s + totalPedido(p), 0))
const itens = computed(() => concluidos.value.reduce((s, p) => s + p.quantidade, 0))

const favorito = computed(() => {
  const m = new Map<string, number>()
  for (const p of concluidos.value) {
    const nome = p.produto?.nome ?? `#${p.produtoId}`
    m.set(nome, (m.get(nome) ?? 0) + p.quantidade)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]
})

const columns: Column<Pedido>[] = [
  { key: 'id', label: 'Nº', sortBy: (p) => p.id, width: '70px' },
  { key: 'dataPedido', label: 'Data', sortBy: (p) => p.dataPedido },
  { key: 'produto', label: 'Produto', sortBy: (p) => p.produto?.nome ?? '' },
  { key: 'quantidade', label: 'Qtd', align: 'right', sortBy: (p) => p.quantidade },
  { key: 'precoUnitario', label: 'Preço unit.', align: 'right' },
  { key: 'total', label: 'Total', align: 'right', sortBy: totalPedido },
  { key: 'status', label: 'Status' },
]

const formOpen = ref(false)
</script>

<template>
  <div class="page">
    <RouterLink to="/clientes" class="back"><AppIcon name="arrowLeft" :size="16" /> Clientes</RouterLink>

    <LoadError v-if="error" :message="error" @retry="reload" />
    <p v-else-if="loading && !clientes.loaded" class="muted">Carregando…</p>

    <div v-else-if="!cliente" class="card">
      <EmptyState icon="users" title="Cliente não encontrado" description="Ele pode ter sido excluído." />
    </div>

    <template v-else>
      <div class="page-header">
        <div class="ident">
          <span class="avatar">{{ cliente.nome.charAt(0).toUpperCase() }}</span>
          <div>
            <h2>
              {{ cliente.nome }}
              <StatusBadge :tone="cliente.status ? 'success' : 'neutral'">{{ cliente.status ? 'Ativo' : 'Inativo' }}</StatusBadge>
            </h2>
            <p>CPF {{ cpf(cliente.cpf) }} · Tel. {{ telefone(cliente.telefone) }}</p>
          </div>
        </div>
        <div class="actions">
          <BaseButton variant="secondary" icon="edit" @click="formOpen = true">Editar</BaseButton>
          <BaseButton
            v-if="cliente.status"
            icon="cart"
            @click="$router.push({ path: '/pedidos/novo', query: { cliente: cliente.id } })"
          >
            Nova venda
          </BaseButton>
        </div>
      </div>

      <div class="grid-stats">
        <StatCard icon="money" label="Total gasto" :value="moeda(totalGasto)" />
        <StatCard icon="receipt" tone="info" label="Pedidos" :value="numero(concluidos.length)" :hint="`${numero(itens)} itens comprados`" />
        <StatCard
          icon="trend"
          tone="accent"
          label="Ticket médio"
          :value="moeda(concluidos.length ? totalGasto / concluidos.length : 0)"
        />
        <StatCard
          icon="leaf"
          label="Produto favorito"
          :value="favorito ? favorito[0] : '—'"
          :hint="historico[0] ? `Última compra em ${dataHora(historico[0].dataPedido)}` : 'Nenhuma compra ainda'"
        />
      </div>

      <div class="card">
        <div class="card-header"><h2>Histórico de pedidos</h2></div>
        <DataTable
          :columns="columns"
          :rows="historico"
          :initial-sort="{ key: 'dataPedido', dir: 'desc' }"
          empty-text="Este cliente ainda não fez pedidos."
        >
          <template #id="{ row }"><span class="muted">#{{ row.id }}</span></template>
          <template #dataPedido="{ row }">{{ dataHora(row.dataPedido) }}</template>
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

      <ClienteForm v-model:open="formOpen" :cliente="cliente" />
    </template>
  </div>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-weight: 500;
  width: fit-content;
}
.ident {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ident h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 20px;
  font-weight: 700;
  flex: none;
}
.cat {
  display: block;
  font-size: 12px;
}
</style>
