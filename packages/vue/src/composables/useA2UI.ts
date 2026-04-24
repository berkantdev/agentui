import { inject } from 'vue'
import type { Component } from 'vue'
import type { AgentUIAdapter } from '@berkantdev/agentui-core'
import { ADAPTER_INJECTION_KEY } from '../plugin/keys.js'

/**
 * Returns the currently registered {@link AgentUIAdapter}, or `null` if
 * no plugin has been installed.
 *
 * Prefer this over a bare `inject(ADAPTER_INJECTION_KEY)` call — it
 * centralises the fallback and keeps consumer call sites clean.
 *
 * @example
 * const adapter = useA2UI()
 * const Comp = adapter?.components.Button
 */
export function useA2UI(): AgentUIAdapter<Component> | null {
  return inject(ADAPTER_INJECTION_KEY, null)
}
