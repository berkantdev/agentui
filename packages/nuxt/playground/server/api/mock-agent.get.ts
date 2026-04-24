import { defineEventHandler, setHeader } from 'h3'
import type { A2UIMessage } from '@berkantdev/agentui-core'

/**
 * Local mock A2UI agent that narrates a tiny scripted conversation,
 * so the playground works without any external backend.
 */
const script: readonly { readonly delayMs: number; readonly msg: A2UIMessage }[] = [
  {
    delayMs: 150,
    msg: {
      type: 'createSurface',
      surfaceId: 's1',
      title: 'Playground Agent',
    },
  },
  {
    delayMs: 150,
    msg: {
      type: 'updateComponents',
      surfaceId: 's1',
      components: [
        { id: 'card', component: { Card: { title: 'Welcome 👋' } } },
        {
          id: 'intro',
          component: { Text: { text: 'Messages stream in live below:' } },
        },
      ],
    },
  },
  {
    delayMs: 600,
    msg: {
      type: 'updateComponents',
      surfaceId: 's1',
      components: [
        {
          id: 'greet',
          component: { Text: { text: 'Hello from the mock agent.' } },
        },
      ],
    },
  },
  {
    delayMs: 600,
    msg: {
      type: 'updateDataModel',
      surfaceId: 's1',
      data: { 'user.step': 1 },
    },
  },
  {
    delayMs: 600,
    msg: {
      type: 'updateComponents',
      surfaceId: 's1',
      components: [
        {
          id: 'cta',
          component: { Button: { label: 'Run again', action: 'restart' } },
        },
      ],
    },
  },
]

function encodeSSE(msg: A2UIMessage): string {
  return `data: ${JSON.stringify(msg)}\n\n`
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'cache-control', 'no-cache, no-transform')
  setHeader(event, 'connection', 'keep-alive')
  setHeader(event, 'x-accel-buffering', 'no')

  const res = event.node.res
  res.flushHeaders()

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

  let aborted = false
  event.node.req.on('close', () => {
    aborted = true
  })

  // Heartbeat so proxies don't close idle connections.
  const heartbeat = setInterval(() => {
    if (aborted) return
    res.write(': ping\n\n')
  }, 15_000)

  try {
    for (const step of script) {
      if (aborted) break
      await wait(step.delayMs)
      if (aborted) break
      res.write(encodeSSE(step.msg))
    }
    // Hold the connection open so the UI can see the final state.
    while (!aborted) {
      await wait(1000)
    }
  } finally {
    clearInterval(heartbeat)
    res.end()
  }
})
