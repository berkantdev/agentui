import type { Meta, StoryObj } from '@storybook/vue3'
import SideBySide from '../SideBySide.vue'
import { defaultAdapter, shadcnAdapter } from '../adapters.js'

const meta: Meta<typeof SideBySide> = {
  title: 'Components/Card',
  component: SideBySide,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof SideBySide>

export const Titled: Story = {
  args: {
    defaultAdapter,
    shadcnAdapter,
    components: [
      {
        id: 'c',
        component: { Card: { title: 'Recent activity' } },
      },
    ],
  },
}

export const Untitled: Story = {
  args: {
    ...Titled.args!,
    components: [{ id: 'c', component: { Card: {} } }],
  },
}
