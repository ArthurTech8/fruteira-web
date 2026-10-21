<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import EmptyState from './EmptyState.vue'

defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="card">
    <EmptyState icon="alert" title="Não foi possível carregar os dados" :description="message">
      <p class="muted cmd">
        Na pasta <code>Projeto-Fruteira</code>, rode <code>dotnet run --launch-profile http</code>
      </p>
      <BaseButton variant="secondary" icon="refresh" @click="$emit('retry')">Tentar novamente</BaseButton>
    </EmptyState>
  </div>
</template>

<style scoped>
.cmd {
  margin: 0 0 8px;
  font-size: 13px;
}
code {
  background: var(--surface-2);
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
