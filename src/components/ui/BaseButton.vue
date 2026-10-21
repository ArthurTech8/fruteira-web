<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    icon?: IconName
    loading?: boolean
    disabled?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)
</script>

<template>
  <button :type="type" class="btn" :class="[variant, size]" :disabled="disabled || loading">
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <AppIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 15 : 17" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.btn.sm {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.primary {
  background: var(--primary);
  color: var(--primary-contrast);
}
.primary:not(:disabled):hover {
  background: var(--primary-hover);
}
.secondary {
  background: var(--surface);
  border-color: var(--border);
}
.secondary:not(:disabled):hover {
  background: var(--surface-2);
}
.ghost {
  background: transparent;
  color: var(--text-muted);
}
.ghost:not(:disabled):hover {
  background: var(--surface-2);
  color: var(--text);
}
.danger {
  background: var(--danger);
  color: #fff;
}
.danger:not(:disabled):hover {
  filter: brightness(0.92);
}
.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
