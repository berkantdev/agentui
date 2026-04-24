<script setup lang="ts">
import { computed } from 'vue'
import type { A2UIComponent, A2UIDataModel, AgentUIAdapter } from '@berkantdev/agentui-core'
import type { Component } from 'vue'
import { ADAPTER_INJECTION_KEY } from '../plugin/keys.js'
import { provide } from 'vue'
import A2Renderer from './A2Renderer.vue'

const props = defineProps<{
  components: readonly A2UIComponent[]
  dataModel?: A2UIDataModel
  adapter?: AgentUIAdapter<Component>
}>()

if (props.adapter) {
  provide(ADAPTER_INJECTION_KEY, props.adapter)
}

const model = computed<A2UIDataModel>(() => props.dataModel ?? {})
</script>

<template>
  <div class="agentui-static">
    <A2Renderer v-for="c in components" :key="c.id" :component="c" :data-model="model" />
  </div>
</template>
