import { markRaw } from 'vue'
import type { Component } from 'vue'
import type { A2UIComponentType, AdapterDefaults, AgentUIAdapter } from '@berkantdev/agentui-core'
import { createAdapter } from '@berkantdev/agentui-core'

/**
 * User-supplied shadcn-vue components, keyed by A2UI component type.
 *
 * shadcn-vue is a copy-paste library — it cannot be imported from npm,
 * so the user passes in the concrete components from their local
 * `@/components/ui/*` and we map them to the A2UI protocol names.
 *
 * Canonical shadcn → A2UI mapping:
 *  - `Button`       → `A2UI.Button`
 *  - `Card`         → `A2UI.Card`
 *  - `Dialog`       → `A2UI.Modal`
 *  - `Input`        → `A2UI.TextField`
 *  - `Checkbox`     → `A2UI.CheckBox`
 *  - `Select`       → `A2UI.ChoicePicker`
 *  - `Slider`       → `A2UI.Slider`
 *  - `Progress`     → `A2UI.Progress`
 *  - `Badge`        → `A2UI.Badge`
 *  - `Avatar`       → `A2UI.Avatar`
 *  - `Alert`        → `A2UI.Alert`
 *  - `Separator`    → `A2UI.Divider`
 *  - `Tabs`         → `A2UI.Tabs`
 *
 * Layout primitives (`Row`, `Column`, `List`, `Text`, `Image`, `Icon`) are
 * not part of shadcn-vue and fall back to whatever the user registers.
 */
export type ShadcnComponents = Partial<Record<A2UIComponentType, Component>>

export interface ShadcnAdapterOptions {
  readonly defaults?: AdapterDefaults | undefined
}

/**
 * Creates a shadcn-vue adapter from user-supplied components.
 *
 * Every component is wrapped with `markRaw` so Vue does not attempt to
 * make the adapter reactive. Unsupplied component types resolve to
 * `undefined` in the adapter — the renderer falls back to the unmapped
 * placeholder.
 *
 * @example
 * // @/components/ui/* are user-owned shadcn copies
 * import { Button } from '@/components/ui/button'
 * import { Card } from '@/components/ui/card'
 * import { Dialog } from '@/components/ui/dialog'
 * import { Input } from '@/components/ui/input'
 *
 * const adapter = createShadcnAdapter({
 *   Button,
 *   Card,
 *   Modal: Dialog,
 *   TextField: Input,
 * })
 */
export function createShadcnAdapter(
  components: ShadcnComponents,
  options: ShadcnAdapterOptions = {},
): AgentUIAdapter<Component> {
  const raw: ShadcnComponents = {}
  for (const key of Object.keys(components) as A2UIComponentType[]) {
    const comp = components[key]
    if (comp) raw[key] = markRaw(comp)
  }
  return createAdapter('shadcn', raw, { defaults: options.defaults })
}
