<script setup lang="ts">
import { computed } from 'vue'
import { useConfirm } from '../../composables/useConfirm'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

const { state, answer } = useConfirm()

const open = computed({
  get: () => state.open,
  set: (v: boolean) => {
    if (!v) answer(false)
  },
})
</script>

<template>
  <BaseModal v-model:open="open" :title="state.options.title" :width="440">
    <p class="msg">{{ state.options.message }}</p>
    <template #footer>
      <BaseButton variant="secondary" @click="answer(false)">Cancelar</BaseButton>
      <BaseButton :variant="state.options.danger ? 'danger' : 'primary'" @click="answer(true)">
        {{ state.options.confirmLabel ?? 'Confirmar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.msg {
  margin: 0;
  color: var(--text-muted);
}
</style>
