import { shallowRef, triggerRef } from 'vue'
import type { Ref } from 'vue'
import type { A2UIComponent, A2UIDataModel, A2UIMessage } from '@berkantdev/agentui-core'

export interface UseSurfaceReturn {
  /** `id` of the surface the agent created, or `null` before `createSurface`. */
  readonly surfaceId: Ref<string | null>
  /** Optional title sent with `createSurface`. */
  readonly title: Ref<string | undefined>
  /** Keyed map of components by `id`, stored in a `shallowRef` Map to avoid deep reactivity. */
  readonly components: Ref<Map<string, A2UIComponent>>
  /** Flat reactive data model. Keys are dotted paths. */
  readonly dataModel: Ref<A2UIDataModel>
  /** Apply a single validated A2UI message to the surface state. */
  applyMessage: (msg: A2UIMessage) => void
  /** Reset surface state as if no message had been received. */
  reset: () => void
}

/**
 * Reactive state container for a single A2UI surface.
 *
 * Uses `shallowRef<Map>` for the component store: swapping/setting entries
 * in the Map is O(1) and does not trigger deep reactivity walks, which
 * matters once a surface has dozens of components. `triggerRef` is used
 * to notify watchers after a Map mutation.
 *
 * @example
 * const { components, applyMessage } = useSurface()
 * applyMessage(parseMessage(sseChunk)!)
 */
export function useSurface(): UseSurfaceReturn {
  const surfaceId = shallowRef<string | null>(null)
  const title = shallowRef<string | undefined>(undefined)
  const components = shallowRef<Map<string, A2UIComponent>>(new Map())
  const dataModel = shallowRef<A2UIDataModel>({})

  function applyMessage(msg: A2UIMessage): void {
    switch (msg.type) {
      case 'createSurface': {
        surfaceId.value = msg.surfaceId
        title.value = msg.title
        components.value = new Map()
        dataModel.value = {}
        return
      }
      case 'updateComponents': {
        if (surfaceId.value !== null && msg.surfaceId !== surfaceId.value) return
        for (const c of msg.components) {
          components.value.set(c.id, c)
        }
        triggerRef(components)
        return
      }
      case 'updateDataModel': {
        if (surfaceId.value !== null && msg.surfaceId !== surfaceId.value) return
        dataModel.value = { ...dataModel.value, ...msg.data }
        return
      }
      case 'deleteSurface': {
        if (surfaceId.value !== null && msg.surfaceId !== surfaceId.value) return
        reset()
        return
      }
    }
  }

  function reset(): void {
    surfaceId.value = null
    title.value = undefined
    components.value = new Map()
    dataModel.value = {}
  }

  return { surfaceId, title, components, dataModel, applyMessage, reset }
}
