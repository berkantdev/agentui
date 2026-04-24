import { z } from 'zod'
import { A2UI_COMPONENT_TYPES } from '../types/components.js'

/**
 * Zod enum over every A2UI v0.10 component type. Shares its source of
 * truth with {@link A2UI_COMPONENT_TYPES} so the type system and the
 * runtime validator never drift apart.
 */
export const A2UIComponentTypeSchema = z.enum(A2UI_COMPONENT_TYPES)

/**
 * Zod schema for a single A2UI component payload (`{ id, component }`).
 * Rejects unknown component-type keys and empty ids; leaves per-type
 * prop validation to individual adapters.
 */
export const A2UIComponentSchema = z.object({
  id: z.string().min(1, 'component id must be non-empty'),
  component: z.record(A2UIComponentTypeSchema, z.unknown()),
})

/**
 * Zod schema for the flat data model map. Keys are arbitrary dotted
 * paths; values are `unknown` and must be narrowed by the consumer.
 */
export const A2UIDataModelSchema = z.record(z.string(), z.unknown())
