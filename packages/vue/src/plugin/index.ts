import type { App, Component, Plugin } from 'vue'
import type { AgentUIAdapter } from '@berkantdev/agentui-core'
import { ADAPTER_INJECTION_KEY } from './keys.js'
import A2Surface from '../components/A2Surface.vue'
import A2StaticRenderer from '../components/A2StaticRenderer.vue'

export { ADAPTER_INJECTION_KEY } from './keys.js'

export interface AgentUIPluginOptions {
  /** The adapter to register globally. Required. */
  readonly adapter: AgentUIAdapter<Component>
  /**
   * Whether to globally register `<A2Surface>` and `<A2StaticRenderer>`.
   * Defaults to `true`. Disable to keep the global component registry clean
   * and import the components explicitly per page instead.
   */
  readonly registerComponents?: boolean
}

/**
 * Vue plugin that provides an {@link AgentUIAdapter} app-wide and
 * (optionally) registers the two public components globally.
 *
 * @example
 * import { createApp } from 'vue'
 * import { AgentUIPlugin, createDefaultAdapter } from '@berkantdev/agentui-vue'
 *
 * createApp(App).use(AgentUIPlugin, { adapter: createDefaultAdapter() })
 */
export const AgentUIPlugin: Plugin<AgentUIPluginOptions> = {
  install(app: App, options: AgentUIPluginOptions) {
    app.provide(ADAPTER_INJECTION_KEY, options.adapter)
    if (options.registerComponents !== false) {
      app.component('A2Surface', A2Surface)
      app.component('A2StaticRenderer', A2StaticRenderer)
    }
  },
}
