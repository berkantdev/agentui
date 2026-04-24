import type { Component, InjectionKey } from 'vue'
import type { AgentUIAdapter } from '@berkantdev/agentui-core'

/**
 * Injection key for the active {@link AgentUIAdapter}.
 *
 * Exported separately from the plugin so that tests and advanced consumers
 * can `provide` an adapter without registering the full Vue plugin.
 */
export const ADAPTER_INJECTION_KEY: InjectionKey<AgentUIAdapter<Component>> =
  Symbol('agentui/adapter')
