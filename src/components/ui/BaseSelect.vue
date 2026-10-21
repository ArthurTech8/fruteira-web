<script setup lang="ts">
import { useId } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

const model = defineModel<string | number | null>()

defineProps<{
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
}>()

const id = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id">{{ label }}<span v-if="required" class="req">*</span></label>
    <select :id="id" v-model="model" :class="{ invalid: !!error }" :required="required">
      <option v-if="placeholder !== undefined" :value="null">{{ placeholder }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
    </select>
    <small v-if="error" class="error">{{ error }}</small>
    <small v-else-if="hint" class="hint">{{ hint }}</small>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
label {
  font-size: 13px;
  font-weight: 500;
}
.req {
  color: var(--danger);
  margin-left: 2px;
}
select {
  width: 100%;
  height: 38px;
  padding: 0 32px 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")
    no-repeat right 12px center;
  appearance: none;
  cursor: pointer;
}
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
select.invalid {
  border-color: var(--danger);
}
.error {
  color: var(--danger);
}
.hint {
  color: var(--text-muted);
}
</style>
