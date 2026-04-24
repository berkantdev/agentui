<script setup lang="ts">
defineProps<{ gap?: string | number }>()
</script>

<template>
  <div
    class="agentui-column"
    :style="{
      display: 'flex',
      flexDirection: 'column',
      gap: typeof gap === 'number' ? `${gap}px` : gap,
    }"
  >
    <slot />
  </div>
</template>
