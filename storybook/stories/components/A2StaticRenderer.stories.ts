import type { Meta, StoryObj } from '@storybook/vue3'
import { A2StaticRenderer } from '@berkantdev/agentui-vue'
import { defaultAdapter } from '../adapters.js'

const meta: Meta<typeof A2StaticRenderer> = {
  title: 'Components/A2StaticRenderer',
  component: A2StaticRenderer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof A2StaticRenderer>

export const CompositeSurface: Story = {
  args: {
    adapter: defaultAdapter,
    components: [
      { id: 'card', component: { Card: { title: 'Welcome' } } },
      {
        id: 'intro',
        component: { Text: { text: 'A small composite rendered with the default adapter.' } },
      },
      {
        id: 'input',
        component: { TextField: { label: 'Your name', placeholder: 'Ada Lovelace' } },
      },
      { id: 'cta', component: { Button: { label: 'Continue', action: 'next' } } },
    ],
  },
}

export const EmptyAdapter: Story = {
  args: {
    adapter: { name: 'empty', components: {} },
    components: [
      { id: 'a', component: { Button: { label: 'Nothing maps this' } } },
    ],
  },
}
