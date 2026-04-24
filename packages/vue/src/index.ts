export * from './components/index.js'
export * from './composables/index.js'
export { AgentUIPlugin, ADAPTER_INJECTION_KEY } from './plugin/index.js'
export type { AgentUIPluginOptions } from './plugin/index.js'

export type {
  A2UIComponent,
  A2UIComponentType,
  A2UIDataModel,
  A2UIMessage,
  AgentUIAdapter,
  AdapterDefaults,
  AdapterOptions,
} from '@berkantdev/agentui-core'
export { parseMessage, parseComponent, createAdapter } from '@berkantdev/agentui-core'
