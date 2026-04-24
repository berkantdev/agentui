<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="agentui-card">
    <header v-if="title" class="agentui-card__header">
      {{ title }}
    </header>
    <div class="agentui-card__body">
      <slot />
    </div>
  </section>
</template>
