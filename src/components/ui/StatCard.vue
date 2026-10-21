<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue'

withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    icon: IconName
    tone?: 'primary' | 'accent' | 'danger' | 'info'
  }>(),
  { tone: 'primary' },
)
</script>

<template>
  <div class="stat card">
    <div class="icon" :class="tone"><AppIcon :name="icon" :size="20" /></div>
    <div class="text">
      <div class="label">{{ label }}</div>
      <div class="value" :title="value">{{ value }}</div>
      <div v-if="hint" class="hint">{{ hint }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px;
}
.icon {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
}
.primary {
  background: var(--primary-soft);
  color: var(--primary);
}
.accent {
  background: var(--accent-soft);
  color: var(--accent);
}
.danger {
  background: var(--danger-soft);
  color: var(--danger);
}
.info {
  background: var(--info-soft);
  color: var(--info);
}
.label {
  color: var(--text-muted);
  font-size: 13px;
}
.value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text {
  min-width: 0;
}
.hint {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 2px;
}
</style>
