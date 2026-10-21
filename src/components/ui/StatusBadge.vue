<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }>(), { tone: 'neutral' })
</script>

<template>
  <span class="badge" :class="tone"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.success {
  background: var(--success-soft);
  color: var(--success);
}
.warning {
  background: var(--warning-soft);
  color: var(--warning);
}
.danger {
  background: var(--danger-soft);
  color: var(--danger);
}
.info {
  background: var(--info-soft);
  color: var(--info);
}
.neutral {
  background: var(--surface-2);
  color: var(--text-muted);
}
</style>
