export type {
  A2UIComponent,
  A2UIComponentType,
  A2UIDataModel,
  A2UIMessage,
  A2UIMessageType,
  A2UIMessageLegacy,
  A2UICreateSurfaceMessage,
  A2UIUpdateComponentsMessage,
  A2UIUpdateDataModelMessage,
  A2UIDeleteSurfaceMessage,
  AgentUIAdapter,
  AdapterDefaults,
  AdapterOptions,
} from './types/index.js'
export { A2UI_COMPONENT_TYPES } from './types/index.js'

export {
  A2UIComponentTypeSchema,
  A2UIComponentSchema,
  A2UIDataModelSchema,
  A2UIMessageSchema,
  CreateSurfaceSchema,
  UpdateComponentsSchema,
  UpdateDataModelSchema,
  DeleteSurfaceSchema,
} from './schema/index.js'

export { parseMessage, parseComponent } from './parser/index.js'

export { createAdapter, defaultAdapter } from './adapter/index.js'
