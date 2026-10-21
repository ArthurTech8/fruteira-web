<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { totalPedido, usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { chaveDia, diasEntre, moeda, numero, rotuloDia } from '../composables/useFormat'
import { moedaTick, useChartTheme } from '../composables/useChartTheme'
import BaseInput from '../components/ui/BaseInput.vue'
import StatCard from '../components/ui/StatCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import LoadError from '../components/ui/LoadError.vue'

const pedidos = usePedidosStore()
const chart = useChartTheme()
const { error, loading, reload } = useLoad((force) => pedidos.load(force))

type Preset = 7 | 30 | 90 | 'tudo' | 'custom'
const preset = ref<Preset>(30)
const de = ref('')
const ate = ref('')

const periodo = computed(() => {
  const fim = new Date()
  if (preset.value === 'custom') {
    return {
      inicio: de.value ? new Date(de.value + 'T00:00:00') : primeiroPedido.value,
      fim: ate.value ? new Date(ate.value + 'T23:59:59') : fim,
    }
  }
  if (preset.value === 'tudo') return { inicio: primeiroPedido.value, fim }
  const inicio = new Date()
  inicio.setDate(fim.getDate() - (preset.value - 1))
  inicio.setHours(0, 0, 0, 0)
  return { inicio, fim }
})

const primeiroPedido = computed(() => {
  const datas = pedidos.items.map((p) => p.dataPedido).sort()
  return datas.length ? new Date(datas[0]) : new Date()
})

const noPeriodo = computed(() => {
  const ini = chaveDia(periodo.value.inicio)
  const fim = chaveDia(periodo.value.fim)
  return pedidos.concluidos.filter((p) => {
    const d = chaveDia(p.dataPedido)
    return d >= ini && d <= fim
  })
})

const faturamento = computed(() => noPeriodo.value.reduce((s, p) => s + totalPedido(p), 0))
const itens = computed(() => noPeriodo.value.reduce((s, p) => s + p.quantidade, 0))
const cancelados = computed(() => {
  const ini = chaveDia(periodo.value.inicio)
  const fim = chaveDia(periodo.value.fim)
  return pedidos.items.filter((p) => !p.status && chaveDia(p.dataPedido) >= ini && chaveDia(p.dataPedido) <= fim).length
})

function agrupar(chave: (p: (typeof noPeriodo.value)[number]) => string) {
  const m = new Map<string, { valor: number; qtd: number; pedidos: number }>()
  for (const p of noPeriodo.value) {
    const k = chave(p)
    const cur = m.get(k) ?? { valor: 0, qtd: 0, pedidos: 0 }
    cur.valor += totalPedido(p)
    cur.qtd += p.quantidade
    cur.pedidos += 1
    m.set(k, cur)
  }
  return [...m.entries()].map(([nome, v]) => ({ nome, ...v })).sort((a, b) => b.valor - a.valor)
}

const porCategoria = computed(() => agrupar((p) => p.produto?.categoria?.nome ?? 'Sem categoria'))
const porProduto = computed(() => agrupar((p) => p.produto?.nome ?? `Produto #${p.produtoId}`).slice(0, 10))
const porCliente = computed(() => agrupar((p) => p.cliente?.nome ?? `Cliente #${p.clienteId}`).slice(0, 8))

const porDia = computed(() => {
  const dias = diasEntre(periodo.value.inicio, periodo.value.fim)
  const m = new Map(dias.map((d) => [d, 0]))
  for (const p of noPeriodo.value) {
    const d = chaveDia(p.dataPedido)
    m.set(d, (m.get(d) ?? 0) + totalPedido(p))
  }
  return { labels: dias.map(rotuloDia), valores: dias.map((d) => m.get(d) ?? 0) }
})

const eixos = computed(() => ({
  x: { grid: { display: false }, ticks: { color: chart.value.text, maxRotation: 0, autoSkipPadding: 12 } },
  y: {
    beginAtZero: true,
    grid: { color: chart.value.grid },
    border: { display: false },
    ticks: { color: chart.value.text, callback: moedaTick },
  },
}))
const tooltipMoeda = {
  callbacks: {
    label: (ctx: { parsed: number | { x: number | null; y: number | null } }) =>
      moeda(typeof ctx.parsed === 'number' ? ctx.parsed : (ctx.parsed.y ?? 0)),
  },
}

const linhaData = computed(() => ({
  labels: porDia.value.labels,
  datasets: [
    {
      label: 'Faturamento',
      data: porDia.value.valores,
      borderColor: chart.value.primary,
      backgroundColor: chart.value.primarySoft,
      fill: true,
      tension: 0.3,
      pointRadius: porDia.value.labels.length > 45 ? 0 : 3,
      pointBackgroundColor: chart.value.primary,
    },
  ],
}))
const linhaOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipMoeda },
  scales: eixos.value,
}))

const roscaData = computed(() => ({
  labels: porCategoria.value.map((c) => c.nome),
  datasets: [
    {
      data: porCategoria.value.map((c) => c.valor),
      backgroundColor: porCategoria.value.map((_, i) => chart.value.series[i % chart.value.series.length]),
      borderColor: chart.value.surface,
      borderWidth: 2,
    },
  ],
}))
const roscaOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: chart.value.text, usePointStyle: true, boxWidth: 8 } },
    tooltip: tooltipMoeda,
  },
}))

const barraData = computed(() => ({
  labels: porProduto.value.map((p) => p.nome),
  datasets: [
    {
      label: 'Faturamento',
      data: porProduto.value.map((p) => p.valor),
      backgroundColor: chart.value.series[1],
      borderRadius: 4,
      maxBarThickness: 22,
    },
  ],
}))
const barraOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: { parsed: { x: number | null } }) => moeda(ctx.parsed.x ?? 0) } } },
  scales: {
    x: { ...eixos.value.y },
    y: { grid: { display: false }, ticks: { color: chart.value.text } },
  },
}))

const presets: { value: Preset; label: string }[] = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
  { value: 'tudo', label: 'Tudo' },
  { value: 'custom', label: 'Personalizado' },
]
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Relatórios de vendas</h2>
        <p>Considera apenas pedidos concluídos.</p>
      </div>
      <div class="filters">
        <div class="seg" role="group" aria-label="Período">
          <button
            v-for="p in presets"
            :key="p.value"
            type="button"
            :class="{ on: preset === p.value }"
            :aria-pressed="preset === p.value"
            @click="preset = p.value"
          >
            {{ p.label }}
          </button>
        </div>
        <template v-if="preset === 'custom'">
          <BaseInput v-model="de" type="date" aria-label="Data inicial" title="Data inicial" />
          <BaseInput v-model="ate" type="date" aria-label="Data final" title="Data final" />
        </template>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />
    <p v-else-if="loading && !pedidos.loaded" class="muted">Carregando…</p>

    <template v-else>
      <div class="grid-stats">
        <StatCard icon="money" label="Faturamento" :value="moeda(faturamento)" />
        <StatCard icon="receipt" tone="info" label="Pedidos" :value="numero(noPeriodo.length)" :hint="`${cancelados} cancelados`" />
        <StatCard icon="box" tone="accent" label="Itens vendidos" :value="numero(itens)" />
        <StatCard icon="trend" label="Ticket médio" :value="moeda(noPeriodo.length ? faturamento / noPeriodo.length : 0)" />
      </div>

      <div v-if="!noPeriodo.length" class="card">
        <EmptyState icon="chart" title="Sem vendas no período" description="Escolha um período maior para ver os gráficos." />
      </div>

      <template v-else>
        <div class="card">
          <div class="card-header"><h2>Faturamento por dia</h2></div>
          <div class="chart-box"><Line :key="chart.key" :data="linhaData" :options="linhaOptions" /></div>
        </div>

        <div class="grid-2 even">
          <div class="card">
            <div class="card-header"><h2>Por categoria</h2></div>
            <div class="chart-box tall"><Doughnut :key="chart.key" :data="roscaData" :options="roscaOptions" /></div>
          </div>
          <div class="card">
            <div class="card-header"><h2>Top 10 produtos</h2></div>
            <div class="chart-box tall"><Bar :key="chart.key" :data="barraData" :options="barraOptions" /></div>
          </div>
        </div>

        <div class="grid-2 even">
          <div class="card">
            <div class="card-header"><h2>Melhores clientes</h2></div>
            <table class="rank">
              <thead>
                <tr><th>Cliente</th><th class="r">Pedidos</th><th class="r">Total</th></tr>
              </thead>
              <tbody>
                <tr v-for="(c, i) in porCliente" :key="c.nome">
                  <td><span class="pos">{{ i + 1 }}</span>{{ c.nome }}</td>
                  <td class="r">{{ c.pedidos }}</td>
                  <td class="r strong">{{ moeda(c.valor) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="card-header"><h2>Categorias em detalhe</h2></div>
            <table class="rank">
              <thead>
                <tr><th>Categoria</th><th class="r">Itens</th><th class="r">Total</th><th class="r">%</th></tr>
              </thead>
              <tbody>
                <tr v-for="c in porCategoria" :key="c.nome">
                  <td>{{ c.nome }}</td>
                  <td class="r">{{ numero(c.qtd) }}</td>
                  <td class="r strong">{{ moeda(c.valor) }}</td>
                  <td class="r muted">{{ ((c.valor / faturamento) * 100).toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.seg {
  display: inline-flex;
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
  flex-wrap: wrap;
}
.seg button {
  border: 0;
  background: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  font-weight: 500;
}
.seg button.on {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
}
.chart-box.tall {
  height: 340px;
}
.rank {
  width: 100%;
  border-collapse: collapse;
}
.rank th,
.rank td {
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
.rank th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  font-weight: 600;
}
.rank tr:last-child td {
  border-bottom: 0;
}
.rank .r {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.pos {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 10px;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
}
</style>
