<script setup lang="ts">
withDefaults(defineProps<{ text?: string; variant?: 'body' | 'heading' | 'caption' }>(), {
  text: '',
  variant: 'body',
})
</script>

<template>
  <h2 v-if="variant === 'heading'" class="agentui-text agentui-text--heading">
    {{ text }}
  </h2>
  <small v-else-if="variant === 'caption'" class="agentui-text agentui-text--caption">
    {{ text }}
  </small>
  <p v-else class="agentui-text agentui-text--body">
    {{ text }}
  </p>
</template>
