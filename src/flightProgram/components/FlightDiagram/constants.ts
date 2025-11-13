import type { InjectionKey } from 'vue'

export const Constants = {
  gateHeight: 98,
  gateGap: 10,
  gatesTopMargin: 132,
  flightHeight: 28,
  flightBottomMargin: 10,
}

export const constantsKey = Symbol() as InjectionKey<typeof Constants>
