<script setup lang="ts">
defineProps<{ gap?: string | number }>()
</script>

<template>
  <div
    class="agentui-row"
    :style="{
      display: 'flex',
      flexDirection: 'row',
      gap: typeof gap === 'number' ? `${gap}px` : gap,
    }"
  >
    <slot />
  </div>
</template>
