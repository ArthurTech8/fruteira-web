<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue'

withDefaults(defineProps<{ title: string; description?: string; icon?: IconName }>(), { icon: 'leaf' })
</script>

<template>
  <div class="empty">
    <div class="icon"><AppIcon :name="icon" :size="22" /></div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 40px 20px;
}
.icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary);
}
h3 {
  font-size: 15px;
}
p {
  margin: 0;
  color: var(--text-muted);
  max-width: 380px;
}
</style>
