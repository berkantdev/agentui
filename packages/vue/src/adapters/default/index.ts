import { markRaw } from 'vue'
import type { Component } from 'vue'
import type { A2UIComponentType, AgentUIAdapter, AdapterOptions } from '@berkantdev/agentui-core'
import { createAdapter } from '@berkantdev/agentui-core'

import DefaultText from './components/DefaultText.vue'
import DefaultRow from './components/DefaultRow.vue'
import DefaultColumn from './components/DefaultColumn.vue'
import DefaultButton from './components/DefaultButton.vue'
import DefaultTextField from './components/DefaultTextField.vue'
import DefaultCard from './components/DefaultCard.vue'
import DefaultPlaceholder from './components/DefaultPlaceholder.vue'

export { default as DefaultText } from './components/DefaultText.vue'
export { default as DefaultRow } from './components/DefaultRow.vue'
export { default as DefaultColumn } from './components/DefaultColumn.vue'
export { default as DefaultButton } from './components/DefaultButton.vue'
export { default as DefaultTextField } from './components/DefaultTextField.vue'
export { default as DefaultCard } from './components/DefaultCard.vue'
export { default as DefaultPlaceholder } from './components/DefaultPlaceholder.vue'

/**
 * The six A2UI component types that ship with a first-class default
 * implementation. The remaining types resolve to {@link DefaultPlaceholder}
 * so a missing component is visible instead of silently dropped.
 */
export const DEFAULT_COVERED_TYPES = [
  'Text',
  'Row',
  'Column',
  'Button',
  'TextField',
  'Card',
] as const satisfies readonly A2UIComponentType[]

const UNCOVERED_TYPES: readonly A2UIComponentType[] = [
  'List',
  'Tabs',
  'Modal',
  'Divider',
  'Image',
  'Icon',
  'Badge',
  'Progress',
  'Avatar',
  'Alert',
  'CheckBox',
  'ChoicePicker',
  'Slider',
]

/**
 * Creates the built-in default adapter.
 *
 * Ships native-HTML implementations for the six most common A2UI
 * component types (Text, Row, Column, Button, TextField, Card). The
 * remaining 14 types are mapped to a placeholder so unmapped components
 * are visible during development instead of silently dropped.
 *
 * All components are wrapped with `markRaw` — adapter components must
 * never be made reactive.
 *
 * @example
 * const adapter = createDefaultAdapter({
 *   overrides: { Button: MyFancyButton },
 * })
 */
export function createDefaultAdapter(
  options: AdapterOptions<Component> = {},
): AgentUIAdapter<Component> {
  const base: Partial<Record<A2UIComponentType, Component>> = {
    Text: markRaw(DefaultText),
    Row: markRaw(DefaultRow),
    Column: markRaw(DefaultColumn),
    Button: markRaw(DefaultButton),
    TextField: markRaw(DefaultTextField),
    Card: markRaw(DefaultCard),
  }
  const placeholder = markRaw(DefaultPlaceholder)
  for (const t of UNCOVERED_TYPES) {
    base[t] = placeholder
  }
  return createAdapter('default', base, options)
}
