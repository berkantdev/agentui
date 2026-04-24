import type { Preview } from '@storybook/vue3'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import './preview.css'

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  decorators: [
    withThemeByDataAttribute<unknown>({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
  ],
}

export default preview
