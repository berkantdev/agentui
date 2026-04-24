/**
 * All component types defined by the A2UI v0.10 specification.
 *
 * Organized into four semantic groups:
 * - Layout: Row, Column, List, Card, Tabs, Modal, Divider
 * - Display: Text, Image, Icon, Badge, Progress, Avatar, Alert
 * - Input: TextField, CheckBox, ChoicePicker, Slider
 * - Action: Button
 */
export type A2UIComponentType =
  | 'Row'
  | 'Column'
  | 'List'
  | 'Card'
  | 'Tabs'
  | 'Modal'
  | 'Divider'
  | 'Text'
  | 'Image'
  | 'Icon'
  | 'Badge'
  | 'Progress'
  | 'Avatar'
  | 'Alert'
  | 'TextField'
  | 'CheckBox'
  | 'ChoicePicker'
  | 'Slider'
  | 'Button'

/**
 * The ordered tuple of all A2UI component types.
 *
 * Useful for runtime iteration (e.g. adapter-coverage checks) and as the
 * single source of truth consumed by the Zod schema.
 */
export const A2UI_COMPONENT_TYPES = [
  'Row',
  'Column',
  'List',
  'Card',
  'Tabs',
  'Modal',
  'Divider',
  'Text',
  'Image',
  'Icon',
  'Badge',
  'Progress',
  'Avatar',
  'Alert',
  'TextField',
  'CheckBox',
  'ChoicePicker',
  'Slider',
  'Button',
] as const satisfies readonly A2UIComponentType[]

/**
 * A single A2UI component instance as sent over the wire.
 *
 * The `component` field uses a partial discriminated record: exactly one
 * component-type key holds the component's payload. The payload is `unknown`
 * because the A2UI spec allows arbitrary props per type — validation of
 * individual props is the adapter's responsibility.
 *
 * @example
 * const button: A2UIComponent = {
 *   id: 'submit-btn',
 *   component: { Button: { label: 'Submit', action: 'submit' } },
 * }
 */
export interface A2UIComponent {
  readonly id: string
  readonly component: Partial<Record<A2UIComponentType, unknown>>
}

/**
 * A flat reactive data model backing a surface.
 *
 * Keys are dotted paths (e.g. `user.name`) that components reference for
 * two-way binding. Values are arbitrary JSON-serializable data.
 */
export type A2UIDataModel = Record<string, unknown>
