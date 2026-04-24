import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
  },
  async viteFinal(config) {
    config.plugins ??= []
    config.plugins.push(vue())
    return config
  },
}

export default config
