import { A2UIComponentSchema } from '../schema/component.schema.js'
import type { A2UIComponent } from '../types/components.js'

/**
 * Validates and types a single A2UI component payload.
 *
 * Accepts either a JSON string or an already-parsed object. Returns
 * `null` when the input is not a valid component — callers are
 * expected to skip invalid components rather than abort rendering.
 *
 * @example
 * const c = parseComponent({ id: 'x', component: { Text: { text: 'hi' } } })
 */
export function parseComponent(input: string | unknown): A2UIComponent | null {
  let candidate: unknown
  if (typeof input === 'string') {
    try {
      candidate = JSON.parse(input)
    } catch {
      return null
    }
  } else {
    candidate = input
  }

  const result = A2UIComponentSchema.safeParse(candidate)
  if (!result.success) return null
  return result.data as A2UIComponent
}
