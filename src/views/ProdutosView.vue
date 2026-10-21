<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProdutosStore } from '../stores/produtos'
import { useCategoriasStore } from '../stores/categorias'
import { useLoad } from '../composables/useLoad'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { moeda } from '../composables/useFormat'
import { nivelEstoque, rotuloNivel, tomNivel, useStockThreshold } from '../composables/useStockThreshold'
import { errorMessage } from '../services/http'
import type { Produto } from '../types/models'
import DataTable, { type Column } from '../components/ui/DataTable.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import LoadError from '../components/ui/LoadError.vue'
import ProdutoForm from '../components/produtos/ProdutoForm.vue'

const produtos = useProdutosStore()
const categorias = useCategoriasStore()
const { confirm } = useConfirm()
const toast = useToast()
const limite = useStockThreshold()
const route = useRoute()

const { error, reload } = useLoad((force) => Promise.all([produtos.load(force), categorias.load(force)]))

const busca = ref('')
// Permite chegar filtrado vindo da tela de Categorias (/produtos?categoria=2)
const categoriaFiltro = ref<number | null>(route.query.categoria ? Number(route.query.categoria) : null)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return produtos.items.filter(
    (p) =>
      (!termo || p.nome.toLowerCase().includes(termo)) &&
      (!categoriaFiltro.value || p.categoriaId === categoriaFiltro.value),
  )
})

const valorEstoque = computed(() => filtrados.value.reduce((s, p) => s + p.preco * p.quantidadeEstoque, 0))

const columns: Column<Produto>[] = [
  { key: 'nome', label: 'Produto', sortBy: (p) => p.nome },
  { key: 'categoria', label: 'Categoria', sortBy: (p) => p.categoria?.nome ?? '' },
  { key: 'preco', label: 'Preço', align: 'right', sortBy: (p) => p.preco },
  { key: 'quantidadeEstoque', label: 'Estoque', align: 'right', sortBy: (p) => p.quantidadeEstoque },
  { key: 'situacao', label: 'Situação' },
  { key: 'acoes', label: '', align: 'right', width: '96px' },
]

const formOpen = ref(false)
const editando = ref<Produto | null>(null)

function novo() {
  editando.value = null
  formOpen.value = true
}
function editar(p: Produto) {
  editando.value = p
  formOpen.value = true
}

async function excluir(p: Produto) {
  const ok = await confirm({
    title: 'Excluir produto',
    message: `Excluir "${p.nome}"? Produtos que já aparecem em pedidos não podem ser excluídos.`,
    confirmLabel: 'Excluir',
    danger: true,
  })
  if (!ok) return
  try {
    await produtos.remove(p.id)
    toast.success(`Produto "${p.nome}" excluído.`)
  } catch (e) {
    // A API devolve 500 quando a FK de Pedido impede a exclusão
    const msg = errorMessage(e)
    toast.error(msg.startsWith('Erro 500') ? `"${p.nome}" possui pedidos registrados e não pode ser excluído.` : msg)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Catálogo de produtos</h2>
        <p>{{ produtos.items.length }} produtos cadastrados · valor em estoque {{ moeda(valorEstoque) }}</p>
      </div>
      <div class="actions">
        <BaseButton icon="plus" @click="novo">Novo produto</BaseButton>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />

    <div v-else class="card">
      <div class="toolbar">
        <BaseInput v-model="busca" class="grow" icon="search" placeholder="Buscar produto…" />
        <BaseSelect
          v-model="categoriaFiltro"
          placeholder="Todas as categorias"
          :options="categorias.items.map((c) => ({ value: c.id, label: c.nome }))"
        />
      </div>
      <DataTable
        :columns="columns"
        :rows="filtrados"
        :loading="produtos.loading && !produtos.loaded"
        :initial-sort="{ key: 'nome', dir: 'asc' }"
        empty-text="Nenhum produto encontrado."
      >
        <template #nome="{ row }"><span class="strong">{{ row.nome }}</span></template>
        <template #categoria="{ row }"><span class="muted">{{ row.categoria?.nome ?? '—' }}</span></template>
        <template #preco="{ row }">{{ moeda(row.preco) }}</template>
        <template #quantidadeEstoque="{ row }">{{ row.quantidadeEstoque }} un</template>
        <template #situacao="{ row }">
          <StatusBadge :tone="tomNivel[nivelEstoque(row.quantidadeEstoque, limite)]">
            {{ rotuloNivel[nivelEstoque(row.quantidadeEstoque, limite)] }}
          </StatusBadge>
        </template>
        <template #acoes="{ row }">
          <span class="row-actions">
            <BaseButton variant="ghost" size="sm" icon="edit" :aria-label="`Editar ${row.nome}`" @click="editar(row)" />
            <BaseButton variant="ghost" size="sm" icon="trash" :aria-label="`Excluir ${row.nome}`" @click="excluir(row)" />
          </span>
        </template>
      </DataTable>
    </div>

    <ProdutoForm v-model:open="formOpen" :produto="editando" />
  </div>
</template>
