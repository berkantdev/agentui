<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="sb-shadcn-card">
    <header
      v-if="title"
      class="sb-shadcn-card__header"
    >
      <h3>{{ title }}</h3>
    </header>
    <div class="sb-shadcn-card__body">
      <slot />
    </div>
  </section>
</template>

<style>
.sb-shadcn-card {
  border: 1px solid var(--sb-border);
  border-radius: 0.75rem;
  background: var(--sb-bg);
  overflow: hidden;
  min-width: 260px;
}
.sb-shadcn-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--sb-border);
}
.sb-shadcn-card__header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.sb-shadcn-card__body {
  padding: 1rem;
}
</style>
