import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AgentUI',
  description: 'A2UI protocol renderer for Vue and Nuxt',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0ea5e9' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      {
        text: 'Packages',
        items: [
          { text: '@berkantdev/agentui-core', link: '/api/core' },
          { text: '@berkantdev/agentui-vue', link: '/api/vue' },
          { text: '@berkantdev/agentui-nuxt', link: '/api/nuxt' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Adapters', link: '/guide/adapters' },
            { text: 'A2UI Protocol', link: '/guide/protocol' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: '@berkantdev/agentui-core', link: '/api/core' },
            { text: '@berkantdev/agentui-vue', link: '/api/vue' },
            { text: '@berkantdev/agentui-nuxt', link: '/api/nuxt' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/berkantdev/agentui' }],

    editLink: {
      pattern: 'https://github.com/berkantdev/agentui/edit/main/docs/:path',
      text: 'Suggest an edit',
    },

    search: { provider: 'local' },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Berkantdev',
    },
  },
})
