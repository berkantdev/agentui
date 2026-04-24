import { computed } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { A2UIDataModel } from '@berkantdev/agentui-core'

/**
 * Reactive getter/setter for a single dotted-path binding in the data model.
 *
 * The returned ref is **writable**: assigning to `.value` mutates the
 * model in-place, preserving reactivity. This mirrors how A2UI input
 * components update bound state (e.g. `TextField.value` → `user.name`).
 *
 * @example
 * const name = useDataModel(dataModel, 'user.name')
 * name.value = 'Ada' // propagates into the surface's dataModel
 */
export function useDataModel<T = unknown>(
  dataModel: Ref<A2UIDataModel>,
  path: string,
): WritableComputedRef<T | undefined> {
  return computed<T | undefined>({
    get: () => dataModel.value[path] as T | undefined,
    set: (next) => {
      dataModel.value = { ...dataModel.value, [path]: next }
    },
  })
}

/**
 * Read-only projection of the whole data model — rarely needed, but handy
 * when a renderer wants to diff the whole map.
 */
export function useDataModelSnapshot(dataModel: Ref<A2UIDataModel>): ComputedRef<A2UIDataModel> {
  return computed(() => dataModel.value)
}
