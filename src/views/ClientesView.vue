<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientesStore } from '../stores/clientes'
import { totalPedido, usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { cpf, moeda, somenteDigitos, telefone } from '../composables/useFormat'
import { errorMessage } from '../services/http'
import type { Cliente } from '../types/models'
import DataTable, { type Column } from '../components/ui/DataTable.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import LoadError from '../components/ui/LoadError.vue'
import ClienteForm from '../components/clientes/ClienteForm.vue'

const clientes = useClientesStore()
const pedidos = usePedidosStore()
const { confirm } = useConfirm()
const toast = useToast()
const router = useRouter()

const { error, reload } = useLoad((force) => Promise.all([clientes.load(force), pedidos.load(force)]))

const busca = ref('')
const situacao = ref<'ativos' | 'inativos' | null>('ativos')

// Total gasto por cliente, calculado a partir dos pedidos concluídos
const gastoPorCliente = computed(() => {
  const m = new Map<number, number>()
  for (const p of pedidos.concluidos) m.set(p.clienteId, (m.get(p.clienteId) ?? 0) + totalPedido(p))
  return m
})

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  const dig = somenteDigitos(termo)
  return clientes.items.filter((c) => {
    if (situacao.value === 'ativos' && !c.status) return false
    if (situacao.value === 'inativos' && c.status) return false
    if (!termo) return true
    return (
      c.nome.toLowerCase().includes(termo) ||
      (!!dig && (somenteDigitos(c.cpf).includes(dig) || somenteDigitos(c.telefone).includes(dig)))
    )
  })
})

const columns: Column<Cliente>[] = [
  { key: 'nome', label: 'Cliente', sortBy: (c) => c.nome },
  { key: 'cpf', label: 'CPF' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'gasto', label: 'Total gasto', align: 'right', sortBy: (c) => gastoPorCliente.value.get(c.id) ?? 0 },
  { key: 'status', label: 'Situação', sortBy: (c) => (c.status ? 0 : 1) },
  { key: 'acoes', label: '', align: 'right', width: '96px' },
]

const formOpen = ref(false)
const editando = ref<Cliente | null>(null)

function novo() {
  editando.value = null
  formOpen.value = true
}
function editar(c: Cliente) {
  editando.value = c
  formOpen.value = true
}

async function inativar(c: Cliente) {
  const ok = await confirm({
    title: 'Inativar cliente',
    message: `${c.nome} será marcado como inativo e não poderá fazer pedidos. O cadastro e o histórico são mantidos e ele pode ser reativado depois.`,
    confirmLabel: 'Inativar',
    danger: true,
  })
  if (!ok) return
  try {
    await clientes.inativar(c.id)
    toast.success(`${c.nome} foi inativado.`)
  } catch (e) {
    toast.error(errorMessage(e))
  }
}

async function reativar(c: Cliente) {
  try {
    await clientes.reativar(c.id)
    toast.success(`${c.nome} foi reativado.`)
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Clientes</h2>
        <p>{{ clientes.ativos.length }} ativos de {{ clientes.items.length }} cadastrados</p>
      </div>
      <div class="actions">
        <BaseButton icon="plus" @click="novo">Novo cliente</BaseButton>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />

    <div v-else class="card">
      <div class="toolbar">
        <BaseInput v-model="busca" class="grow" icon="search" placeholder="Buscar por nome, CPF ou telefone…" />
        <BaseSelect
          v-model="situacao"
          placeholder="Todos"
          :options="[
            { value: 'ativos', label: 'Somente ativos' },
            { value: 'inativos', label: 'Somente inativos' },
          ]"
        />
      </div>
      <DataTable
        :columns="columns"
        :rows="filtrados"
        :loading="clientes.loading && !clientes.loaded"
        :initial-sort="{ key: 'nome', dir: 'asc' }"
        empty-text="Nenhum cliente encontrado."
        clickable
        @row-click="(c) => router.push(`/clientes/${c.id}`)"
      >
        <template #nome="{ row }"><span class="strong">{{ row.nome }}</span></template>
        <template #cpf="{ row }"><span class="muted nowrap">{{ cpf(row.cpf) }}</span></template>
        <template #telefone="{ row }"><span class="muted nowrap">{{ telefone(row.telefone) }}</span></template>
        <template #gasto="{ row }">{{ moeda(gastoPorCliente.get(row.id) ?? 0) }}</template>
        <template #status="{ row }">
          <StatusBadge :tone="row.status ? 'success' : 'neutral'">{{ row.status ? 'Ativo' : 'Inativo' }}</StatusBadge>
        </template>
        <template #acoes="{ row }">
          <span class="row-actions" @click.stop>
            <BaseButton variant="ghost" size="sm" icon="edit" :aria-label="`Editar ${row.nome}`" @click="editar(row)" />
            <BaseButton
              v-if="row.status"
              variant="ghost"
              size="sm"
              icon="userOff"
              :aria-label="`Inativar ${row.nome}`"
              title="Inativar"
              @click="inativar(row)"
            />
            <BaseButton
              v-else
              variant="ghost"
              size="sm"
              icon="refresh"
              :aria-label="`Reativar ${row.nome}`"
              title="Reativar"
              @click="reativar(row)"
            />
          </span>
        </template>
      </DataTable>
    </div>

    <ClienteForm v-model:open="formOpen" :cliente="editando" />
  </div>
</template>
