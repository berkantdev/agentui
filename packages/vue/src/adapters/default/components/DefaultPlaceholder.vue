<script setup lang="ts">
defineProps<{ componentId?: string }>()
</script>

<template>
  <div class="agentui-placeholder" :data-component-id="componentId">
    <code>[unmapped component]</code>
  </div>
</template>
