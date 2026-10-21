<script setup lang="ts">
import { useId } from 'vue'
import AppIcon, { type IconName } from './AppIcon.vue'

const model = defineModel<string | number | null>()

withDefaults(
  defineProps<{
    label?: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    icon?: IconName
    prefix?: string
    min?: number | string
    max?: number | string
    step?: number | string
    required?: boolean
    maxlength?: number
    inputmode?: 'text' | 'numeric' | 'decimal' | 'tel'
    /** Rótulo acessível quando não há label visível */
    ariaLabel?: string
  }>(),
  { type: 'text' },
)

const id = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id">{{ label }}<span v-if="required" class="req">*</span></label>
    <div class="control" :class="{ invalid: !!error, 'has-icon': !!icon, 'has-prefix': !!prefix }">
      <AppIcon v-if="icon" :name="icon" :size="16" class="lead" />
      <span v-if="prefix" class="lead prefix">{{ prefix }}</span>
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :step="step"
        :required="required"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :aria-invalid="!!error"
        :aria-label="ariaLabel ?? placeholder"
      />
    </div>
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
.control {
  position: relative;
}
.lead {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.prefix {
  font-size: 13px;
}
input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.has-icon input {
  padding-left: 34px;
}
.has-prefix input {
  padding-left: 36px;
}
input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.invalid input {
  border-color: var(--danger);
}
.error {
  color: var(--danger);
}
.hint {
  color: var(--text-muted);
}
</style>
