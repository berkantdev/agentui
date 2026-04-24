<script setup lang="ts">
import { ref, shallowRef, watchEffect } from 'vue'
import type { A2UIComponent } from '@berkantdev/agentui-core'

useHead({ title: 'Static editor — AgentUI Playground' })

const initial = [
  { id: 'card', component: { Card: { title: 'Static demo' } } },
  { id: 'body', component: { Text: { text: 'Edit the JSON on the left.' } } },
  { id: 'cta', component: { Button: { label: 'Do a thing', action: 'noop' } } },
]

const source = ref(JSON.stringify(initial, null, 2))
const parseError = ref<string | null>(null)
const components = shallowRef<A2UIComponent[]>(initial)

watchEffect(() => {
  try {
    components.value = JSON.parse(source.value) as A2UIComponent[]
    parseError.value = null
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : 'invalid JSON'
    components.value = []
  }
})
</script>

<template>
  <main class="page">
    <header>
      <NuxtLink to="/">← back</NuxtLink>
      <h1>Static editor</h1>
      <p>
        Uses the auto-imported <code>&lt;A2StaticRenderer&gt;</code>
        with the default adapter installed by the Nuxt module.
      </p>
    </header>

    <div class="grid">
      <section>
        <h2>A2UI JSON</h2>
        <textarea v-model="source" spellcheck="false" />
        <div v-if="parseError" class="err">
          {{ parseError }}
        </div>
      </section>
      <section>
        <h2>Rendered</h2>
        <div class="preview">
          <A2StaticRenderer :components="components" />
        </div>
      </section>
    </div>
  </main>
</template>

<style>
.page {
  max-width: 1080px;
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
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr 1fr;
}
.grid section h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  margin: 0 0 0.5rem;
}
textarea {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  resize: vertical;
}
.preview {
  padding: 1rem;
  min-height: 400px;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
}
.err {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  color: #b91c1c;
  font-family: ui-monospace, Menlo, Consolas, monospace;
}
code {
  padding: 0.1em 0.35em;
  background: #f1f5f9;
  border-radius: 0.25rem;
  font-size: 0.9em;
}
</style>
