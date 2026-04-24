import {
  createDefaultAdapter,
  createShadcnAdapter,
} from '@berkantdev/agentui-vue/adapters'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Dialog } from '../components/ui/dialog'
import { Input } from '../components/ui/input'

export const defaultAdapter = createDefaultAdapter()

export const shadcnAdapter = createShadcnAdapter({
  Button,
  Card,
  Modal: Dialog,
  TextField: Input,
})
