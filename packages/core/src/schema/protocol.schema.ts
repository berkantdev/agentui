import { z } from 'zod'
import { A2UIComponentSchema, A2UIDataModelSchema } from './component.schema.js'

const surfaceId = z.string().min(1, 'surfaceId must be non-empty')

/** Zod schema for the `createSurface` message. */
export const CreateSurfaceSchema = z.object({
  type: z.literal('createSurface'),
  surfaceId,
  title: z.string().optional(),
})

/** Zod schema for the `updateComponents` message. */
export const UpdateComponentsSchema = z.object({
  type: z.literal('updateComponents'),
  surfaceId,
  components: z.array(A2UIComponentSchema),
})

/** Zod schema for the `updateDataModel` message. */
export const UpdateDataModelSchema = z.object({
  type: z.literal('updateDataModel'),
  surfaceId,
  data: A2UIDataModelSchema,
})

/** Zod schema for the `deleteSurface` message. */
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
