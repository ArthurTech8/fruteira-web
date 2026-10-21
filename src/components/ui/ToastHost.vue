<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import AppIcon from './AppIcon.vue'

const { toasts, dismiss } = useToast()
const icons = { success: 'check', error: 'alert', info: 'info' } as const
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.tone" role="status">
        <AppIcon :name="icons[t.tone]" :size="18" />
        <span>{{ t.message }}</span>
        <button type="button" aria-label="Fechar" @click="dismiss(t.id)"><AppIcon name="close" :size="14" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(420px, calc(100vw - 32px));
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  border-left-width: 4px;
  box-shadow: var(--shadow-lg);
}
.toast span {
  flex: 1;
}
.success {
  border-left-color: var(--success);
  color: var(--success);
}
.error {
  border-left-color: var(--danger);
  color: var(--danger);
}
.info {
  border-left-color: var(--info);
  color: var(--info);
}
.toast span {
  color: var(--text);
}
button {
  border: 0;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: grid;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
