<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useProdutosStore } from '../stores/produtos'
import { useClientesStore } from '../stores/clientes'
import { totalPedido, usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { chaveDia, dataHora, diasEntre, moeda, numero, rotuloDia } from '../composables/useFormat'
import { nivelEstoque, rotuloNivel, tomNivel, useStockThreshold } from '../composables/useStockThreshold'
import { moedaTick, useChartTheme } from '../composables/useChartTheme'
import StatCard from '../components/ui/StatCard.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import LoadError from '../components/ui/LoadError.vue'

const produtos = useProdutosStore()
const clientes = useClientesStore()
const pedidos = usePedidosStore()
const limite = useStockThreshold()
const chart = useChartTheme()

const { error, loading, reload } = useLoad((force) =>
  Promise.all([produtos.load(force), clientes.load(force), pedidos.load(force)]),
)

const hora = new Date().getHours()
const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

const hoje = chaveDia(new Date())
const mesAtual = hoje.slice(0, 7)

const vendasHoje = computed(() => pedidos.concluidos.filter((p) => chaveDia(p.dataPedido) === hoje))
const vendasMes = computed(() => pedidos.concluidos.filter((p) => chaveDia(p.dataPedido).startsWith(mesAtual)))
const soma = (lista: typeof pedidos.concluidos) => lista.reduce((s, p) => s + totalPedido(p), 0)

const estoqueBaixo = computed(() =>
  produtos.items.filter((p) => p.quantidadeEstoque <= limite.value).sort((a, b) => a.quantidadeEstoque - b.quantidadeEstoque),
)

const ultimos = computed(() => pedidos.items.slice(0, 6))

// Faturamento dos últimos 14 dias
const serie = computed(() => {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(fim.getDate() - 13)
  const dias = diasEntre(inicio, fim)
  const porDia = new Map(dias.map((d) => [d, 0]))
  for (const p of pedidos.concluidos) {
    const d = chaveDia(p.dataPedido)
    if (porDia.has(d)) porDia.set(d, porDia.get(d)! + totalPedido(p))
  }
  return { labels: dias.map(rotuloDia), valores: dias.map((d) => porDia.get(d)!) }
})

const chartData = computed(() => ({
  labels: serie.value.labels,
  datasets: [
    {
      label: 'Faturamento',
      data: serie.value.valores,
      backgroundColor: chart.value.primary,
      borderRadius: 4,
      maxBarThickness: 28,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: { parsed: { y: number | null } }) => moeda(ctx.parsed.y ?? 0) } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: chart.value.text } },
    y: { beginAtZero: true, grid: { color: chart.value.grid }, border: { display: false }, ticks: { color: chart.value.text, callback: moedaTick } },
  },
}))
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>{{ saudacao }}! 🍊</h2>
        <p>Resumo da fruteira com os dados do banco em tempo real.</p>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />
    <p v-else-if="loading && !pedidos.loaded" class="muted">Carregando…</p>

    <template v-else>
      <div class="grid-stats">
        <StatCard icon="money" label="Vendas hoje" :value="moeda(soma(vendasHoje))" :hint="`${vendasHoje.length} pedidos`" />
        <StatCard
          icon="trend"
          tone="info"
          label="Faturamento do mês"
          :value="moeda(soma(vendasMes))"
          :hint="`${vendasMes.length} pedidos`"
        />
        <StatCard
          icon="receipt"
          tone="accent"
          label="Ticket médio (mês)"
          :value="moeda(vendasMes.length ? soma(vendasMes) / vendasMes.length : 0)"
          :hint="`${numero(clientes.ativos.length)} clientes ativos`"
        />
        <StatCard
          icon="alert"
          tone="danger"
          label="Estoque baixo"
          :value="String(estoqueBaixo.length)"
          :hint="`até ${limite} unidades`"
        />
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h2>Faturamento · últimos 14 dias</h2>
            <RouterLink to="/relatorios">Ver relatórios</RouterLink>
          </div>
          <div v-if="serie.valores.some((v) => v > 0)" class="chart-box">
            <Bar :key="chart.key" :data="chartData" :options="chartOptions" />
          </div>
          <EmptyState
            v-else
            icon="chart"
            title="Nenhuma venda nos últimos 14 dias"
            description="Registre uma venda ou consulte períodos anteriores em Relatórios."
          />
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Repor em breve</h2>
            <RouterLink to="/produtos/estoque">Ver todos</RouterLink>
          </div>
          <EmptyState v-if="!estoqueBaixo.length" icon="check" title="Estoque em dia" />
          <ul v-else class="list-plain mini">
            <li v-for="p in estoqueBaixo.slice(0, 6)" :key="p.id">
              <div>
                <span class="strong">{{ p.nome }}</span>
                <small class="muted">{{ p.categoria?.nome }}</small>
              </div>
              <StatusBadge :tone="tomNivel[nivelEstoque(p.quantidadeEstoque, limite)]">
                {{ p.quantidadeEstoque }} un · {{ rotuloNivel[nivelEstoque(p.quantidadeEstoque, limite)] }}
              </StatusBadge>
            </li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Últimos pedidos</h2>
          <RouterLink to="/pedidos">Ver todos</RouterLink>
        </div>
        <EmptyState v-if="!ultimos.length" icon="receipt" title="Nenhum pedido ainda" />
        <ul v-else class="list-plain mini">
          <li v-for="p in ultimos" :key="p.id">
            <div>
              <span class="strong">{{ p.cliente?.nome ?? `Cliente #${p.clienteId}` }}</span>
              <small class="muted">
                #{{ p.id }} · {{ p.quantidade }}× {{ p.produto?.nome }} · {{ dataHora(p.dataPedido) }}
              </small>
            </div>
            <span class="valor" :class="{ cancelado: !p.status }">{{ moeda(totalPedido(p)) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mini li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
}
.mini li:last-child {
  border-bottom: 0;
}
.mini li > div {
  min-width: 0;
}
.mini small {
  display: block;
  font-size: 12px;
}
.valor {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.valor.cancelado {
  text-decoration: line-through;
  color: var(--text-muted);
}
</style>
