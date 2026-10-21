<script setup lang="ts">
import BaseButton from '../components/ui/BaseButton.vue'
import EmptyState from '../components/ui/EmptyState.vue'
</script>

<template>
  <div class="card">
    <EmptyState icon="leaf" title="Página não encontrada" description="O endereço acessado não existe nesta fruteira.">
      <BaseButton icon="arrowLeft" @click="$router.push('/')">Voltar ao Dashboard</BaseButton>
    </EmptyState>
  </div>
</template>
