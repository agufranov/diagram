export type Gate = {
  id: number
  start: number
  end: number
  name: string
  order: number
}

export type Flight = {
  start: number
  end: number
  name: string
  type: 0 | 1
  gate: number
}
