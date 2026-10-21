<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppTopbar from './components/layout/AppTopbar.vue'
import ToastHost from './components/ui/ToastHost.vue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'

const menuOpen = ref(false)
const route = useRoute()

// Fecha o menu lateral (celular) ao trocar de página
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <div class="shell">
    <AppSidebar :open="menuOpen" @close="menuOpen = false" />
    <div class="main">
      <AppTopbar @toggle-menu="menuOpen = !menuOpen" />
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
  <ToastHost />
  <ConfirmDialog />
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.main {
  margin-left: var(--sidebar-w);
  min-width: 0;
}
.content {
  padding: 24px 28px 48px;
  max-width: 1400px;
}
@media (max-width: 900px) {
  .main {
    margin-left: 0;
  }
  .content {
    padding: 16px 16px 40px;
  }
}
</style>
