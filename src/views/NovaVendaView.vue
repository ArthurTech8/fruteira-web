<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientesStore } from '../stores/clientes'
import { useProdutosStore } from '../stores/produtos'
import { usePedidosStore } from '../stores/pedidos'
import { useLoad } from '../composables/useLoad'
import { useToast } from '../composables/useToast'
import { moeda } from '../composables/useFormat'
import { errorMessage } from '../services/http'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import LoadError from '../components/ui/LoadError.vue'
import AppIcon from '../components/ui/AppIcon.vue'

const clientes = useClientesStore()
const produtos = useProdutosStore()
const pedidos = usePedidosStore()
const toast = useToast()
const router = useRouter()
const route = useRoute()

// Recarrega sempre: o estoque pode ter mudado desde a última visita
const { error, reload } = useLoad(() => Promise.all([clientes.load(true), produtos.load(true)]))

const clienteId = ref<number | null>(route.query.cliente ? Number(route.query.cliente) : null)
const produtoId = ref<number | null>(null)
const quantidade = ref<number | null>(1)
const enviando = ref(false)
const erroApi = ref<string | null>(null)
const tentou = ref(false)

const clienteOptions = computed(() =>
  [...clientes.ativos].sort((a, b) => a.nome.localeCompare(b.nome)).map((c) => ({ value: c.id, label: c.nome })),
)

const produtoOptions = computed(() =>
  produtos.items.map((p) => ({
    value: p.id,
    label: `${p.nome} · ${moeda(p.preco)} · ${p.quantidadeEstoque} un`,
    disabled: p.quantidadeEstoque <= 0,
  })),
)

const produto = computed(() => (produtoId.value ? produtos.byId(produtoId.value) : undefined))
const cliente = computed(() => (clienteId.value ? clientes.byId(clienteId.value) : undefined))
const qtd = computed(() => Number(quantidade.value) || 0)
const total = computed(() => (produto.value ? produto.value.preco * qtd.value : 0))

// Mesmas regras do PedidoCreateDto e do PedidosController
const erros = computed(() => {
  const e: Record<string, string> = {}
  if (!clienteId.value) e.cliente = 'Selecione um cliente válido.'
  else if (cliente.value && !cliente.value.status) e.cliente = `O cliente ${cliente.value.nome} está inativo.`
  if (!produtoId.value) e.produto = 'Selecione um produto válido.'
  if (!Number.isInteger(qtd.value) || qtd.value < 1 || qtd.value > 10000) e.quantidade = 'A quantidade deve ser entre 1 e 10000.'
  else if (produto.value && qtd.value > produto.value.quantidadeEstoque)
    e.quantidade = `Estoque insuficiente. Disponível: ${produto.value.quantidadeEstoque} un.`
  return e
})
const valido = computed(() => Object.keys(erros.value).length === 0)

async function registrar() {
  tentou.value = true
  erroApi.value = null
  if (!valido.value) return
  enviando.value = true
  try {
    const pedido = await pedidos.create({
      clienteId: clienteId.value!,
      produtoId: produtoId.value!,
      quantidade: qtd.value,
    })
    toast.success(`Venda #${pedido.id} registrada: ${moeda(pedido.quantidade * pedido.precoUnitario)}.`)
    router.push('/pedidos')
  } catch (e) {
    erroApi.value = errorMessage(e)
    // O estoque pode ter mudado no servidor; atualiza para mostrar o valor real
    produtos.load(true).catch(() => {})
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>Registrar venda</h2>
        <p>O preço é o cadastrado no produto e o estoque é baixado automaticamente.</p>
      </div>
    </div>

    <LoadError v-if="error" :message="error" @retry="reload" />

    <form v-else class="pdv" novalidate @submit.prevent="registrar">
      <div class="card card-pad fields">
        <BaseSelect
          v-model="clienteId"
          label="Cliente"
          required
          placeholder="Selecione o cliente…"
          :options="clienteOptions"
          :error="tentou ? erros.cliente : undefined"
          hint="Somente clientes ativos podem comprar"
        />
        <BaseSelect
          v-model="produtoId"
          label="Produto"
          required
          placeholder="Selecione o produto…"
          :options="produtoOptions"
          :error="tentou ? erros.produto : undefined"
        />
        <div class="qtd-row">
          <BaseInput
            v-model.number="quantidade"
            label="Quantidade"
            type="number"
            min="1"
            :max="produto?.quantidadeEstoque ?? 10000"
            inputmode="numeric"
            required
            :error="tentou || (produto && qtd > produto.quantidadeEstoque) ? erros.quantidade : undefined"
          />
          <div class="steps">
            <BaseButton variant="secondary" aria-label="Diminuir" :disabled="qtd <= 1" @click="quantidade = Math.max(1, qtd - 1)">−</BaseButton>
            <BaseButton variant="secondary" aria-label="Aumentar" @click="quantidade = qtd + 1">+</BaseButton>
          </div>
        </div>

        <div v-if="erroApi" class="api-error" role="alert">
          <AppIcon name="alert" :size="18" />
          <div>
            <strong>A API recusou a venda</strong>
            <p>{{ erroApi }}</p>
          </div>
        </div>
      </div>

      <aside class="card summary">
        <div class="card-header"><h2>Resumo</h2></div>
        <div class="card-pad">
          <dl>
            <div><dt>Cliente</dt><dd>{{ cliente?.nome ?? '—' }}</dd></div>
            <div><dt>Produto</dt><dd>{{ produto?.nome ?? '—' }}</dd></div>
            <div><dt>Categoria</dt><dd>{{ produto?.categoria?.nome ?? '—' }}</dd></div>
            <div><dt>Preço unitário</dt><dd>{{ produto ? moeda(produto.preco) : '—' }}</dd></div>
            <div><dt>Quantidade</dt><dd>{{ qtd }}</dd></div>
            <div v-if="produto">
              <dt>Estoque após a venda</dt>
              <dd :class="{ 'danger-text': produto.quantidadeEstoque - qtd < 0 }">{{ produto.quantidadeEstoque - qtd }} un</dd>
            </div>
          </dl>
          <div class="total">
            <span>Total</span>
            <strong>{{ moeda(total) }}</strong>
          </div>
          <BaseButton type="submit" icon="check" :loading="enviando" class="submit">Confirmar venda</BaseButton>
        </div>
      </aside>
    </form>
  </div>
</template>

<style scoped>
.pdv {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
  gap: 16px;
  align-items: start;
}
@media (max-width: 900px) {
  .pdv {
    grid-template-columns: minmax(0, 1fr);
  }
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.qtd-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.qtd-row > :first-child {
  flex: 1;
}
.steps {
  display: flex;
  gap: 6px;
  margin-top: 25px;
}
.steps :deep(.btn) {
  width: 38px;
  padding: 0;
  font-size: 18px;
}
dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
dl > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
dt {
  color: var(--text-muted);
}
dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
}
.total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 18px 0 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
}
.total strong {
  font-size: 26px;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}
.submit {
  width: 100%;
  height: 44px;
}
.api-error {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
}
.api-error p {
  margin: 2px 0 0;
  color: var(--text);
}
</style>
