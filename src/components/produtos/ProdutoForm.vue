<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseButton from '../ui/BaseButton.vue'
import { useCategoriasStore } from '../../stores/categorias'
import { useProdutosStore } from '../../stores/produtos'
import { useToast } from '../../composables/useToast'
import { errorMessage } from '../../services/http'
import type { Produto } from '../../types/models'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{
  /** Produto em edição; null para cadastrar um novo */
  produto: Produto | null
  /** Destaca o campo de estoque (usado pela tela de reposição) */
  focoEstoque?: boolean
}>()

const categorias = useCategoriasStore()
const produtos = useProdutosStore()
const toast = useToast()

const form = reactive({
  nome: '',
  preco: null as number | null,
  quantidadeEstoque: null as number | null,
  categoriaId: null as number | null,
})
const reposicao = ref<number | null>(null)
const errors = reactive<Record<string, string>>({})
const saving = ref(false)

watch(open, (v) => {
  if (!v) return
  form.nome = props.produto?.nome ?? ''
  form.preco = props.produto?.preco ?? null
  form.quantidadeEstoque = props.produto?.quantidadeEstoque ?? 0
  form.categoriaId = props.produto?.categoriaId ?? null
  reposicao.value = null
  Object.keys(errors).forEach((k) => delete errors[k])
})

const categoriaOptions = computed(() => categorias.items.map((c) => ({ value: c.id, label: c.nome })))
const titulo = computed(() =>
  props.produto ? (props.focoEstoque ? `Repor estoque · ${props.produto.nome}` : 'Editar produto') : 'Novo produto',
)

// Na reposição o usuário informa quanto chegou e o sistema soma ao estoque atual
watch(reposicao, (v) => {
  if (props.produto && v !== null && v !== undefined && String(v) !== '') {
    form.quantidadeEstoque = props.produto.quantidadeEstoque + Number(v)
  }
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.nome.trim()) errors.nome = 'Informe o nome do produto.'
  if (form.preco === null || String(form.preco) === '' || Number(form.preco) <= 0) errors.preco = 'Informe um preço maior que zero.'
  if (form.quantidadeEstoque === null || String(form.quantidadeEstoque) === '' || Number(form.quantidadeEstoque) < 0)
    errors.quantidadeEstoque = 'O estoque não pode ser negativo.'
  else if (!Number.isInteger(Number(form.quantidadeEstoque))) errors.quantidadeEstoque = 'Use um número inteiro.'
  if (!form.categoriaId) errors.categoriaId = 'Selecione uma categoria.'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  const data = {
    nome: form.nome.trim(),
    preco: Number(form.preco),
    quantidadeEstoque: Number(form.quantidadeEstoque),
    categoriaId: Number(form.categoriaId),
  }
  try {
    if (props.produto) {
      await produtos.update(props.produto.id, data)
      toast.success(`Produto "${data.nome}" atualizado.`)
    } else {
      await produtos.create(data)
      toast.success(`Produto "${data.nome}" cadastrado.`)
    }
    open.value = false
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal v-model:open="open" :title="titulo">
    <form id="produto-form" class="form-grid" novalidate @submit.prevent="save">
      <template v-if="focoEstoque && produto">
        <div class="full repor">
          <span class="muted">Estoque atual</span>
          <strong>{{ produto.quantidadeEstoque }} un</strong>
        </div>
        <BaseInput
          v-model.number="reposicao"
          class="full"
          label="Quantidade recebida"
          type="number"
          min="0"
          inputmode="numeric"
          hint="Será somada ao estoque atual"
        />
      </template>
      <BaseInput v-model="form.nome" class="full" label="Nome" required :error="errors.nome" placeholder="Ex.: Banana Prata" />
      <BaseSelect
        v-model="form.categoriaId"
        class="full"
        label="Categoria"
        required
        placeholder="Selecione…"
        :options="categoriaOptions"
        :error="errors.categoriaId"
      />
      <BaseInput
        v-model.number="form.preco"
        label="Preço (por unidade)"
        type="number"
        step="0.01"
        min="0"
        prefix="R$"
        inputmode="decimal"
        required
        :error="errors.preco"
      />
      <BaseInput
        v-model.number="form.quantidadeEstoque"
        label="Estoque"
        type="number"
        min="0"
        inputmode="numeric"
        required
        :error="errors.quantidadeEstoque"
        hint="Unidades disponíveis"
      />
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="produto-form" :loading="saving">Salvar</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.repor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
</style>
