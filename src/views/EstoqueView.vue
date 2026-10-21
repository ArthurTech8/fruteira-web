<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProdutosStore } from '../stores/produtos'
import { useCategoriasStore } from '../stores/categorias'
import { usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { nivelEstoque, rotuloNivel, tomNivel, useStockThreshold } from '../composables/useStockThreshold'
import { moeda } from '../composables/useFormat'
import type { Produto } from '../types/models'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import StatCard from '../components/ui/StatCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import LoadError from '../components/ui/LoadError.vue'
import ProdutoForm from '../components/produtos/ProdutoForm.vue'

const produtos = useProdutosStore()
const categorias = useCategoriasStore()
const pedidos = usePedidosStore()
const limite = useStockThreshold()

const { error, loading, reload } = useLoad((force) =>
  Promise.all([produtos.load(force), categorias.load(force), pedidos.load(force)]),
)

// Média de unidades vendidas por dia nos últimos 30 dias, para estimar quando acaba
const vendaDiaria = computed(() => {
  const desde = new Date()
  desde.setDate(desde.getDate() - 30)
  const m = new Map<number, number>()
  for (const p of pedidos.concluidos) {
    if (new Date(p.dataPedido) >= desde) m.set(p.produtoId, (m.get(p.produtoId) ?? 0) + p.quantidade)
  }
  return new Map([...m].map(([id, q]) => [id, q / 30]))
})

const alertas = computed(() =>
  produtos.items
    .filter((p) => p.quantidadeEstoque <= limite.value)
    .map((p) => {
      const porDia = vendaDiaria.value.get(p.id) ?? 0
      return {
        ...p,
        nivel: nivelEstoque(p.quantidadeEstoque, limite.value),
        porDia,
        diasRestantes: porDia > 0 ? Math.floor(p.quantidadeEstoque / porDia) : null,
        pct: Math.min(100, (p.quantidadeEstoque / limite.value) * 100),
      }
    })
    .sort((a, b) => a.quantidadeEstoque - b.quantidadeEstoque),
)

const zerados = computed(() => alertas.value.filter((a) => a.nivel === 'zerado').length)
const criticos = computed(() => alertas.value.filter((a) => a.nivel === 'critico').length)
// Quanto custaria repor todos até o limite configurado (a preço de venda)
const custoReposicao = computed(() =>
  alertas.value.reduce((s, a) => s + Math.max(0, limite.value - a.quantidadeEstoque) * a.preco, 0),
)

const formOpen = ref(false)
const repondo = ref<Produto | null>(null)
function repor(p: Produto) {
  repondo.value = produtos.byId(p.id) ?? null
  formOpen.value = true
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Alerta de estoque</h2>
        <p>Produtos com {{ limite }} unidades ou menos, do mais crítico para o menos crítico.</p>
      </div>
      <BaseInput
        v-model.number="limite"
        class="limite"
        label="Limite de alerta (un)"
        type="number"
        min="1"
        inputmode="numeric"
      />
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />
    <p v-else-if="loading && !produtos.loaded" class="muted">Carregando…</p>

    <template v-else>
      <div class="grid-stats">
        <StatCard icon="alert" tone="accent" label="Produtos em alerta" :value="String(alertas.length)" :hint="`de ${produtos.items.length} produtos`" />
        <StatCard icon="close" tone="danger" label="Sem estoque" :value="String(zerados)" :hint="`${criticos} em nível crítico`" />
        <StatCard icon="money" tone="info" label="Reposição até o limite" :value="moeda(custoReposicao)" hint="estimado pelo preço de venda" />
      </div>

      <div class="card">
        <EmptyState
          v-if="!alertas.length"
          icon="check"
          title="Estoque em dia"
          :description="`Nenhum produto está com ${limite} unidades ou menos.`"
        />
        <ul v-else class="list-plain alerts">
          <li v-for="a in alertas" :key="a.id" class="alert-row">
            <div class="info">
              <div class="name">
                <span class="strong">{{ a.nome }}</span>
                <StatusBadge :tone="tomNivel[a.nivel]">{{ rotuloNivel[a.nivel] }}</StatusBadge>
              </div>
              <small class="muted">
                {{ a.categoria?.nome ?? categorias.byId(a.categoriaId)?.nome }} · {{ moeda(a.preco) }}
                <template v-if="a.diasRestantes !== null"> · acaba em ~{{ a.diasRestantes }} {{ a.diasRestantes === 1 ? 'dia' : 'dias' }}</template>
                <template v-else> · sem vendas nos últimos 30 dias</template>
              </small>
            </div>
            <div class="level">
              <div class="bar"><span :class="a.nivel" :style="{ width: a.pct + '%' }" /></div>
              <span class="qty">{{ a.quantidadeEstoque }} un</span>
            </div>
            <BaseButton variant="secondary" size="sm" icon="plus" @click="repor(a)">Repor</BaseButton>
          </li>
        </ul>
      </div>
    </template>

    <ProdutoForm v-model:open="formOpen" :produto="repondo" foco-estoque />
  </div>
</template>

<style scoped>
.limite {
  width: 180px;
}
.alert-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px auto;
  gap: 16px;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.alert-row:last-child {
  border-bottom: 0;
}
.name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.level {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bar {
  flex: 1;
  height: 8px;
  border-radius: 99px;
  background: var(--surface-2);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--warning);
}
.bar .critico,
.bar .zerado {
  background: var(--danger);
}
.qty {
  width: 56px;
  text-align: right;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 700px) {
  .alert-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .level {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}
</style>
