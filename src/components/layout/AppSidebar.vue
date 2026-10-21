<script setup lang="ts">
import AppIcon, { type IconName } from '../ui/AppIcon.vue'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const groups: { title: string; links: { to: string; label: string; icon: IconName }[] }[] = [
  {
    title: 'Visão geral',
    links: [
      { to: '/', label: 'Dashboard', icon: 'dashboard' },
      { to: '/relatorios', label: 'Relatórios', icon: 'chart' },
    ],
  },
  {
    title: 'Vendas',
    links: [
      { to: '/pedidos/novo', label: 'Nova venda', icon: 'cart' },
      { to: '/pedidos', label: 'Pedidos', icon: 'receipt' },
    ],
  },
  {
    title: 'Cadastros',
    links: [
      { to: '/produtos', label: 'Produtos', icon: 'box' },
      { to: '/categorias', label: 'Categorias', icon: 'tag' },
      { to: '/clientes', label: 'Clientes', icon: 'users' },
    ],
  },
  {
    title: 'Estoque',
    links: [{ to: '/produtos/estoque', label: 'Alerta de estoque', icon: 'alert' }],
  },
]
</script>

<template>
  <div v-if="open" class="overlay" @click="$emit('close')" />
  <aside class="sidebar" :class="{ open }">
    <RouterLink to="/" class="brand">
      <span class="logo">
        <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
          <circle cx="16" cy="18" r="11" fill="#f08c2e" />
          <path d="M16 7c0-3 2-5 5-5-0.5 3-2.5 5-5 5z" fill="#3a8f3e" />
        </svg>
      </span>
      <span>
        <strong>Fruteira</strong>
        <small>Gestão de hortifrúti</small>
      </span>
    </RouterLink>

    <nav>
      <div v-for="g in groups" :key="g.title" class="group">
        <div class="group-title">{{ g.title }}</div>
        <!-- exact-active evita que /pedidos fique ativo em /pedidos/novo -->
        <RouterLink v-for="l in g.links" :key="l.to" :to="l.to" class="link" exact-active-class="active">
          <AppIcon :name="l.icon" />
          {{ l.label }}
        </RouterLink>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  color: var(--text);
  text-decoration: none;
}
.brand strong {
  display: block;
  font-size: 16px;
}
.brand small {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
}
.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
}
nav {
  padding: 4px 12px 20px;
}
.group {
  margin-top: 14px;
}
.group-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 0 10px 6px;
}
.link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 500;
  text-decoration: none;
}
.link:hover {
  background: var(--surface-2);
  color: var(--text);
}
.link.active {
  background: var(--primary-soft);
  color: var(--primary);
}
.overlay {
  display: none;
}
@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.2s;
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open {
    transform: none;
  }
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 39;
    background: rgba(10, 15, 8, 0.4);
  }
}
</style>
