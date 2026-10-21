<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const open = defineModel<boolean>('open', { required: true })
withDefaults(defineProps<{ title: string; width?: number }>(), { width: 520 })

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

watch(
  open,
  (v) => {
    if (v) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="backdrop" @mousedown.self="open = false">
        <div class="modal card" role="dialog" aria-modal="true" :style="{ maxWidth: width + 'px' }">
          <header>
            <h2>{{ title }}</h2>
            <button class="close" type="button" aria-label="Fechar" @click="open = false">
              <AppIcon name="close" />
            </button>
          </header>
          <div class="body"><slot /></div>
          <footer v-if="$slots.footer"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(10, 15, 8, 0.45);
}
.modal {
  width: 100%;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
header h2 {
  font-size: 16px;
}
.close {
  border: 0;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: grid;
}
.close:hover {
  background: var(--surface-2);
  color: var(--text);
}
.body {
  padding: 20px;
  overflow: auto;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
