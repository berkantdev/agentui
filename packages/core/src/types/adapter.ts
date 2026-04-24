import type { A2UIComponentType } from './components.js'

/**
 * Shared configuration consumed by adapter components at render time.
 *
 * Keep this intentionally small — adapter-specific config belongs in the
 * adapter itself, not in the shared defaults.
 */
export interface AdapterDefaults {
  readonly locale?: string | undefined
  readonly dateFormat?: string | undefined
}

/**
 * Framework-agnostic adapter interface.
 *
 * `TComponent` is intentionally generic so that core has zero runtime
 * dependency on any UI framework. Framework-specific packages (Vue, React,
 * ...) specialize it — e.g. the Vue package exports
 * `AgentUIAdapter<import('vue').Component>`.
 */
export interface AgentUIAdapter<TComponent = unknown> {
  readonly name: string
  readonly components: Partial<Record<A2UIComponentType, TComponent>>
  readonly defaults?: AdapterDefaults | undefined
}

/**
 * Options passed to {@link createAdapter}.
 *
 * `overrides` replace any component already present in the base map;
 * `defaults` are merged into the adapter's configuration.
 */
export interface AdapterOptions<TComponent = unknown> {
  readonly overrides?: Partial<Record<A2UIComponentType, TComponent>> | undefined
  readonly defaults?: AdapterDefaults | undefined
}
