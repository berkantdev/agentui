import { z } from 'zod'
import { A2UIComponentSchema, A2UIDataModelSchema } from './component.schema.js'

const surfaceId = z.string().min(1, 'surfaceId must be non-empty')

export const CreateSurfaceSchema = z.object({
  type: z.literal('createSurface'),
  surfaceId,
  title: z.string().optional(),
})

export const UpdateComponentsSchema = z.object({
  type: z.literal('updateComponents'),
  surfaceId,
  components: z.array(A2UIComponentSchema),
})

export const UpdateDataModelSchema = z.object({
  type: z.literal('updateDataModel'),
  surfaceId,
  data: A2UIDataModelSchema,
})

export const DeleteSurfaceSchema = z.object({
  type: z.literal('deleteSurface'),
  surfaceId,
})

/**
 * Discriminated union of all A2UI v0.10 messages — used by
 * {@link parseMessage} at the SSE boundary.
 */
export const A2UIMessageSchema = z.discriminatedUnion('type', [
  CreateSurfaceSchema,
  UpdateComponentsSchema,
  UpdateDataModelSchema,
  DeleteSurfaceSchema,
])
