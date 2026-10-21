<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'
import { useClientesStore } from '../../stores/clientes'
import { useToast } from '../../composables/useToast'
import { somenteDigitos } from '../../composables/useFormat'
import { errorMessage } from '../../services/http'
import type { Cliente } from '../../types/models'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ cliente: Cliente | null }>()

const clientes = useClientesStore()
const toast = useToast()

const form = reactive({ nome: '', cpf: '', telefone: '', status: true })
const errors = reactive<Record<string, string>>({})
const saving = ref(false)

watch(open, (v) => {
  if (!v) return
  form.nome = props.cliente?.nome ?? ''
  form.cpf = props.cliente?.cpf ?? ''
  form.telefone = props.cliente?.telefone ?? ''
  form.status = props.cliente?.status ?? true
  Object.keys(errors).forEach((k) => delete errors[k])
})

const titulo = computed(() => (props.cliente ? 'Editar cliente' : 'Novo cliente'))

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.nome.trim()) errors.nome = 'O nome é obrigatório.'
  const cpf = somenteDigitos(form.cpf)
  if (cpf && cpf.length !== 11) errors.cpf = 'O CPF deve ter 11 dígitos.'
  else if (cpf && clientes.items.some((c) => c.id !== props.cliente?.id && somenteDigitos(c.cpf) === cpf))
    errors.cpf = 'Já existe um cliente com este CPF.'
  const tel = somenteDigitos(form.telefone)
  if (tel && (tel.length < 8 || tel.length > 11)) errors.telefone = 'Telefone inválido (8 a 11 dígitos).'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  // O banco guarda CPF e telefone só com dígitos
  const data = {
    nome: form.nome.trim(),
    cpf: somenteDigitos(form.cpf) || null,
    telefone: somenteDigitos(form.telefone) || null,
    status: form.status,
  }
  try {
    if (props.cliente) {
      await clientes.update(props.cliente.id, data)
      toast.success(`Cliente "${data.nome}" atualizado.`)
    } else {
      await clientes.create(data)
      toast.success(`Cliente "${data.nome}" cadastrado.`)
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
    <form id="cliente-form" class="form-grid" novalidate @submit.prevent="save">
      <BaseInput v-model="form.nome" class="full" label="Nome" required :error="errors.nome" placeholder="Nome completo" />
      <BaseInput
        v-model="form.cpf"
        label="CPF"
        inputmode="numeric"
        :maxlength="14"
        placeholder="000.000.000-00"
        :error="errors.cpf"
      />
      <BaseInput
        v-model="form.telefone"
        label="Telefone"
        inputmode="tel"
        :maxlength="15"
        placeholder="(51) 99999-9999"
        :error="errors.telefone"
      />
      <label v-if="cliente" class="checkbox full">
        <input v-model="form.status" type="checkbox" />
        Cliente ativo (pode fazer pedidos)
      </label>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="cliente-form" :loading="saving">Salvar</BaseButton>
    </template>
  </BaseModal>
</template>
