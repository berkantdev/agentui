import type { A2UIComponent, A2UIDataModel } from './components.js'

/**
 * A2UI v0.10 protocol message.
 *
 * Every message is a discriminated union over the `type` field. Messages
 * are dispatched to the matching surface via their `surfaceId`.
 */
export type A2UIMessage =
  | A2UICreateSurfaceMessage
  | A2UIUpdateComponentsMessage
  | A2UIUpdateDataModelMessage
  | A2UIDeleteSurfaceMessage

/** Creates or resets the surface identified by `surfaceId`. */
export interface A2UICreateSurfaceMessage {
  readonly type: 'createSurface'
  readonly surfaceId: string
  readonly title?: string | undefined
}

/** Upserts the listed components on the target surface by id. */
export interface A2UIUpdateComponentsMessage {
  readonly type: 'updateComponents'
  readonly surfaceId: string
  readonly components: readonly A2UIComponent[]
}

/** Merges the provided key/value pairs into the surface's data model. */
export interface A2UIUpdateDataModelMessage {
  readonly type: 'updateDataModel'
  readonly surfaceId: string
  readonly data: A2UIDataModel
}

/** Tears down the surface and clears its components/data model. */
export interface A2UIDeleteSurfaceMessage {
  readonly type: 'deleteSurface'
  readonly surfaceId: string
}

/**
 * A2UI v0.10 message type discriminators — useful for exhaustive switches.
 */
export type A2UIMessageType = A2UIMessage['type']

/**
 * A2UI v0.8 legacy protocol message — preserved for adapters that need
 * backward compatibility.
 *
 * Not parsed by `parseMessage`. A dedicated v0.8 compat parser can be
 * introduced as a separate pass without touching the v0.10 path.
 */
export type A2UIMessageLegacy =
  | { readonly type: 'beginRendering'; readonly surfaceId: string }
  | {
      readonly type: 'surfaceUpdate'
      readonly surfaceId: string
      readonly components: readonly A2UIComponent[]
    }
  | {
      readonly type: 'dataModelUpdate'
      readonly surfaceId: string
      readonly data: A2UIDataModel
    }
