---
'@berkantdev/agentui-vue': major
---

`useSSE`: switch from native `EventSource` to `fetch` + `ReadableStream`
so SSE requests can carry custom headers (most importantly `Authorization`).

**Breaking changes:**

- Signature is now object-based: `useSSE(options)` instead of
  `useSSE(url, options)`. Pass `url` inside the options object.
- `error.value` is now `Ref<SSEError | null>` (was `Ref<Event | null>`).
  `SSEError` has a discriminated `type` of `'network' | 'http' | 'parse'`
  plus `message` and optional `status` / `raw` fields.
- The `onError` callback receives the typed `SSEError` (not a raw `Event`).

**New:**

- `headers?: Record<string, string> | () => Promise<Record<string, string>> | Record<string, string>`
  — the factory form is re-resolved on every (re)connect, so expiring
  tokens are refreshed automatically.
- Multi-chunk SSE framing (data continuations across network chunks),
  multi-line `data:` fields joined with `\n`, `:` comments and non-`message`
  events handled per the HTML spec.
- `A2Surface` forwards a matching `headers` prop and a typed `error` event.

**Migration:**

```ts
// before
const { status } = useSSE(url, { onMessage })

// after
const { status } = useSSE({ url, onMessage })

// with auth
const { status } = useSSE({
  url: '/agent/stream',
  headers: async () => ({
    Authorization: `Bearer ${await refreshToken()}`,
  }),
  onMessage,
})
```
