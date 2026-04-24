<script setup lang="ts">
import { computed } from 'vue'
import type { A2UIComponent, A2UIComponentType, A2UIDataModel } from '@berkantdev/agentui-core'
import { useA2UI } from '../composables/useA2UI.js'

const props = defineProps<{
  component: A2UIComponent
  dataModel: A2UIDataModel
}>()

const adapter = useA2UI()

const resolved = computed(() => {
  const keys = Object.keys(props.component.component)
  const type = keys[0] as A2UIComponentType | undefined
  if (!type) return null
  const Comp = adapter?.components[type] ?? null
  const propsForComp = props.component.component[type] ?? {}
  return { Comp, type, propsForComp }
})
</script>

<template>
  <component
    :is="resolved.Comp"
    v-if="resolved?.Comp"
    v-bind="resolved.propsForComp as object"
    :data-model="dataModel"
    :component-id="component.id"
  />
  <span v-else-if="resolved" class="agentui-missing" :data-type="resolved.type">
    [unmapped: {{ resolved.type }}]
  </span>
</template>
