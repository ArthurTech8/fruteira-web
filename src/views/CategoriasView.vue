<script setup lang="ts">
import { computed } from 'vue'
import { useCategoriasStore } from '../stores/categorias'
import { useProdutosStore } from '../stores/produtos'
import { totalPedido, usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { moeda, numero } from '../composables/useFormat'
import { useStockThreshold } from '../composables/useStockThreshold'
import LoadError from '../components/ui/LoadError.vue'
import AppIcon from '../components/ui/AppIcon.vue'

const categorias = useCategoriasStore()
const produtos = useProdutosStore()
const pedidos = usePedidosStore()
const limite = useStockThreshold()

const { error, loading, reload } = useLoad((force) =>
  Promise.all([categorias.load(force), produtos.load(force), pedidos.load(force)]),
)

const resumo = computed(() =>
  categorias.items.map((c) => {
    const prods = produtos.items.filter((p) => p.categoriaId === c.id)
    const vendas = pedidos.concluidos.filter((p) => p.produto?.categoriaId === c.id)
    return {
      ...c,
      qtdProdutos: prods.length,
      unidades: prods.reduce((s, p) => s + p.quantidadeEstoque, 0),
      valorEstoque: prods.reduce((s, p) => s + p.preco * p.quantidadeEstoque, 0),
      estoqueBaixo: prods.filter((p) => p.quantidadeEstoque <= limite.value).length,
      faturamento: vendas.reduce((s, p) => s + totalPedido(p), 0),
      itensVendidos: vendas.reduce((s, p) => s + p.quantidade, 0),
    }
  }),
)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Categorias</h2>
        <p>Resumo de estoque e vendas por categoria. As categorias são mantidas diretamente no banco.</p>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />
    <p v-else-if="loading && !categorias.loaded" class="muted">Carregando…</p>

    <div v-else class="cats">
      <RouterLink
        v-for="c in resumo"
        :key="c.id"
        :to="{ path: '/produtos', query: { categoria: c.id } }"
        class="cat card"
      >
        <div class="head">
          <span class="ico"><AppIcon name="tag" /></span>
          <div>
            <h3>{{ c.nome }}</h3>
            <span class="muted">{{ c.qtdProdutos }} {{ c.qtdProdutos === 1 ? 'produto' : 'produtos' }}</span>
          </div>
          <AppIcon name="arrowRight" class="go" />
        </div>
        <dl>
          <div><dt>Em estoque</dt><dd>{{ numero(c.unidades) }} un</dd></div>
          <div><dt>Valor em estoque</dt><dd>{{ moeda(c.valorEstoque) }}</dd></div>
          <div><dt>Faturamento</dt><dd>{{ moeda(c.faturamento) }}</dd></div>
          <div><dt>Itens vendidos</dt><dd>{{ numero(c.itensVendidos) }}</dd></div>
        </dl>
        <p v-if="c.estoqueBaixo" class="warn">
          <AppIcon name="alert" :size="14" /> {{ c.estoqueBaixo }} com estoque baixo
        </p>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.cats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.cat {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  color: var(--text);
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s;
}
.cat:hover {
  border-color: var(--primary);
  text-decoration: none;
  transform: translateY(-1px);
}
.head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.head h3 {
  font-size: 15px;
}
.head .muted {
  font-size: 13px;
}
.ico {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  flex: none;
}
.go {
  margin-left: auto;
  color: var(--text-muted);
}
dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 0;
}
dt {
  font-size: 12px;
  color: var(--text-muted);
}
dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.warn {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--warning);
}
</style>
