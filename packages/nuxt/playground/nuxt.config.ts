export default defineNuxtConfig({
  modules: ['@berkantdev/agentui-nuxt'],
  agentui: {
    adapter: 'default',
  },
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
})
