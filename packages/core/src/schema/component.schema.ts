import { z } from 'zod'
import { A2UI_COMPONENT_TYPES } from '../types/components.js'

export const A2UIComponentTypeSchema = z.enum(A2UI_COMPONENT_TYPES)

export const A2UIComponentSchema = z.object({
  id: z.string().min(1, 'component id must be non-empty'),
  component: z.record(A2UIComponentTypeSchema, z.unknown()),
})

export const A2UIDataModelSchema = z.record(z.string(), z.unknown())
