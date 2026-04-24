import type { Meta, StoryObj } from '@storybook/vue3'
import SideBySide from '../SideBySide.vue'
import { defaultAdapter, shadcnAdapter } from '../adapters.js'

const meta: Meta<typeof SideBySide> = {
  title: 'Components/Text',
  component: SideBySide,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof SideBySide>

export const Body: Story = {
  args: {
    defaultAdapter,
    shadcnAdapter,
    components: [
      {
        id: 't',
        component: { Text: { text: 'The quick brown fox jumps over the lazy dog.' } },
      },
    ],
  },
}

export const Heading: Story = {
  args: {
    ...Body.args!,
    components: [
      {
        id: 't',
        component: { Text: { text: 'Section heading', variant: 'heading' } },
      },
    ],
  },
}

export const Caption: Story = {
  args: {
    ...Body.args!,
    components: [
      {
        id: 't',
        component: { Text: { text: 'Small caption text', variant: 'caption' } },
      },
    ],
  },
}
