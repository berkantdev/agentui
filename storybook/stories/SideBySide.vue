<script setup lang="ts">
import type { A2UIComponent, AgentUIAdapter } from '@berkantdev/agentui-core'
import type { Component } from 'vue'
import { A2StaticRenderer } from '@berkantdev/agentui-vue'

defineProps<{
  components: readonly A2UIComponent[]
  defaultAdapter: AgentUIAdapter<Component>
  shadcnAdapter: AgentUIAdapter<Component>
}>()
</script>

<template>
  <div class="sb-side-by-side">
    <section>
      <h3>Default adapter</h3>
      <A2StaticRenderer
        :components="components"
        :adapter="defaultAdapter"
      />
    </section>
    <section>
      <h3>shadcn adapter</h3>
      <A2StaticRenderer
        :components="components"
        :adapter="shadcnAdapter"
      />
    </section>
  </div>
</template>
