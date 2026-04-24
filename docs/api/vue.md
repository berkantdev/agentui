# `@berkantdev/agentui-vue`

<!-- TODO(docs-phase-2): Full API reference for @berkantdev/agentui-vue
  - Components:
      <A2Surface url headers? autoConnect? initialDelayMs? maxDelayMs? maxRetries?>
        props, slots (status slot), exposed state (status/error/retries),
        emitted events (open / error / give-up)
      <A2StaticRenderer components dataModel? adapter?>
      <A2Renderer component dataModel> (internal — document briefly)
  - Composables:
      useSSE({ url, headers, onMessage, onOpen, onError, onGiveUp, ... }) →
        { status, error, retries, connect, disconnect }
        backoff semantics, SSEError discriminants, reactive url re-connect
      useSurface() → { surfaceId, title, components, dataModel, applyMessage, reset }
      useDataModel(model, path), useDataModelSnapshot(model)
      useA2UI() — returns the active adapter or null
  - Plugin: AgentUIPlugin options, ADAPTER_INJECTION_KEY for advanced DI
  - Adapters subpath (@berkantdev/agentui-vue/adapters):
      createDefaultAdapter, DEFAULT_COVERED_TYPES, per-component exports
      createShadcnAdapter with the full canonical mapping table
-->

::: info Placeholder
Full reference pending the next documentation PR.

Every public export carries JSDoc. Source of truth:
[`packages/vue/src/index.ts`](https://github.com/berkantdev/agentui/tree/main/packages/vue/src/index.ts)
and the adapters sub-entry
[`packages/vue/src/adapters/index.ts`](https://github.com/berkantdev/agentui/tree/main/packages/vue/src/adapters/index.ts).

For real code you can copy today, see
[Getting Started](/guide/getting-started) — it has working snippets for
`<A2Surface>`, `<A2StaticRenderer>`, the plugin, and both shipped
adapters.
:::
