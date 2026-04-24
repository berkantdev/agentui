<script setup lang="ts">
useHead({ title: 'AgentUI Playground' })
</script>

<template>
  <main class="page">
    <header>
      <h1>AgentUI Nuxt Playground</h1>
      <p>
        Smoke tests for <code>@berkantdev/agentui-nuxt</code> — module auto-imports, global components,
        and the default adapter.
      </p>
    </header>

    <section class="cards">
      <NuxtLink to="/live" class="card">
        <h2>Live SSE</h2>
        <p>
          Connects <code>&lt;A2Surface&gt;</code> to the local mock agent at
          <code>/api/mock-agent</code>. Watch messages arrive and the surface build itself up.
        </p>
      </NuxtLink>

      <NuxtLink to="/static" class="card">
        <h2>Static editor</h2>
        <p>
          Paste or edit A2UI JSON on the left, see the rendered output on the right. No connection —
          all local.
        </p>
      </NuxtLink>
    </section>
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
.page header h1 {
  margin: 0 0 0.25rem;
  font-size: 2rem;
}
.page header p {
  margin: 0 0 2rem;
  color: #475569;
}
.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}
.card {
  display: block;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms;
}
.card:hover {
  border-color: #0ea5e9;
}
.card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
.card p {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
}
code {
  padding: 0.1em 0.35em;
  background: #f1f5f9;
  border-radius: 0.25rem;
  font-size: 0.9em;
}
</style>
