<script setup lang="ts">
useHead({ title: 'Live SSE — AgentUI Playground' })
// `useSurface` is injected via Nuxt auto-imports from @berkantdev/agentui-nuxt.
const debug = useSurface()
</script>

<template>
  <main class="page">
    <header>
      <NuxtLink to="/">← back</NuxtLink>
      <h1>Live SSE</h1>
      <p>
        <code>&lt;A2Surface&gt;</code> is globally registered by the Nuxt module. The mock agent
        streams from <code>/api/mock-agent</code>.
      </p>
    </header>

    <div class="surface">
      <A2Surface url="/api/mock-agent">
        <template #status="{ status, retries }">
          <div class="status" :data-status="status">
            status: <strong>{{ status }}</strong>
            <span v-if="retries > 0"> (retry #{{ retries }})</span>
          </div>
        </template>
      </A2Surface>
    </div>

    <details class="debug">
      <summary>Surface state (auto-imported useSurface)</summary>
      <pre>{{
        {
          surfaceId: debug.surfaceId.value,
          title: debug.title.value,
          dataModel: debug.dataModel.value,
        }
      }}</pre>
    </details>
  </main>
</template>

<style>
.page {
  max-width: 720px;
  margin: 4rem auto;
  padding: 0 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #0f172a;
}
.page header a {
  color: #475569;
  text-decoration: none;
}
.page header h1 {
  margin: 0.5rem 0 0.25rem;
  font-size: 2rem;
}
.page header p {
  margin: 0 0 2rem;
  color: #475569;
}
.surface {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
}
.status {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #475569;
}
.status[data-status='open'] strong {
  color: #059669;
}
.status[data-status='error'] strong {
  color: #dc2626;
}
.debug {
  margin-top: 1.5rem;
  font-size: 0.85rem;
}
.debug pre {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow: auto;
}
code {
  padding: 0.1em 0.35em;
  background: #f1f5f9;
  border-radius: 0.25rem;
  font-size: 0.9em;
}
</style>
