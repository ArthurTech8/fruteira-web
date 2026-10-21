<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiStatus } from '../../services/http'
import { useTheme } from '../../composables/useTheme'
import AppIcon from '../ui/AppIcon.vue'
import BaseButton from '../ui/BaseButton.vue'

defineEmits<{ toggleMenu: [] }>()

const route = useRoute()
const router = useRouter()
const { theme, toggle } = useTheme()

const status = computed(() => {
  if (apiStatus.online === null) return { cls: 'pending', text: 'Conectando…', tip: '' }
  if (apiStatus.online) return { cls: 'on', text: 'API conectada', tip: 'Projeto-Fruteira respondendo em localhost:5022' }
  return {
    cls: 'off',
    text: 'API offline',
    tip: 'Rode "dotnet run --launch-profile http" na pasta Projeto-Fruteira',
  }
})
</script>

<template>
  <header class="topbar">
    <button class="menu" type="button" aria-label="Abrir menu" @click="$emit('toggleMenu')">
      <AppIcon name="menu" />
    </button>
    <h1>{{ route.meta.title }}</h1>
    <div class="right">
      <span class="status" :class="status.cls" :title="status.tip">
        <span class="dot" />
        <span class="status-text">{{ status.text }}</span>
      </span>
      <button
        class="icon-btn"
        type="button"
        :aria-label="theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'"
        @click="toggle"
      >
        <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" />
      </button>
      <BaseButton v-if="route.name !== 'nova-venda'" class="cta" icon="cart" @click="router.push('/pedidos/novo')">
        Nova venda
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  padding: 0 28px;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
h1 {
  font-size: 18px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.menu,
.icon-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.icon-btn:hover,
.menu:hover {
  color: var(--text);
}
.menu {
  display: none;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}
.on .dot {
  background: var(--success);
}
.off {
  color: var(--danger);
  border-color: var(--danger);
}
.off .dot {
  background: var(--danger);
}
@media (max-width: 900px) {
  .topbar {
    padding: 0 16px;
  }
  .menu {
    display: grid;
  }
}
@media (max-width: 640px) {
  .status-text,
  .cta {
    display: none;
  }
}
</style>
