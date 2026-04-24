import type { AdapterOptions, AgentUIAdapter } from '../types/adapter.js'
import type { A2UIComponentType } from '../types/components.js'

/**
 * Creates a typed, immutable {@link AgentUIAdapter}.
 *
 * The returned adapter is a plain object — no reactive wrappers, no
 * hidden state. Framework packages pass their UI components via the
 * generic parameter `TComponent`.
 *
 * @example
 * const adapter = createAdapter('default', { Text: MyText })
 * const withOverride = createAdapter('custom', base.components, {
 *   overrides: { Button: MyButton },
 *   defaults: { locale: 'de' },
 * })
 */
export function createAdapter<TComponent>(
  name: string,
  baseComponents: Partial<Record<A2UIComponentType, TComponent>>,
  options: AdapterOptions<TComponent> = {},
): AgentUIAdapter<TComponent> {
  const components: Partial<Record<A2UIComponentType, TComponent>> = {
    ...baseComponents,
    ...(options.overrides ?? {}),
  }

  if (options.defaults !== undefined) {
    return { name, components, defaults: options.defaults }
  }
  return { name, components }
}
