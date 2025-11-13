import type { useViewportController } from './composables/useViewportController'

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

export type TViewportController = ReturnType<typeof useViewportController>
