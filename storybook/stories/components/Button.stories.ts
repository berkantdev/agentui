import type { Meta, StoryObj } from '@storybook/vue3'
import SideBySide from '../SideBySide.vue'
import { defaultAdapter, shadcnAdapter } from '../adapters.js'

const meta: Meta<typeof SideBySide> = {
  title: 'Components/Button',
  component: SideBySide,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof SideBySide>

export const Default: Story = {
  args: {
    defaultAdapter,
    shadcnAdapter,
    components: [
      { id: 'b', component: { Button: { label: 'Submit', action: 'submit' } } },
    ],
  },
}

export const Disabled: Story = {
  args: {
    ...Default.args!,
    components: [
      {
        id: 'b',
        component: { Button: { label: 'Unavailable', action: 'x', disabled: true } },
      },
    ],
  },
}

export const Destructive: Story = {
  args: {
    ...Default.args!,
    components: [
      {
        id: 'b',
        component: { Button: { label: 'Delete account', action: 'delete', variant: 'destructive' } },
      },
    ],
  },
}
