<script setup lang="ts">
import _ from 'lodash'
import { computed, onMounted, ref, watch } from 'vue'
import { useViewportController } from '../../components/FlightDiagram/components/Viewport/composables/useViewportController'
import EVA from './components/EVA/EVA.vue'
import Viewport from './components/Viewport/Viewport.vue'
import { Constants } from './constants'
import { flights, gates } from './data'
import type { Flight } from './types'
import { findFirst, findLast } from './utils'

const viewportController = useViewportController({
  start: +new Date('2025/01/01'),
  end: +new Date('2026/01/01'),
})

const surfaceStart = +new Date('2025/03/01')
const surfaceEnd = +new Date('2025/08/01')

const {
  renderStart,
  renderEnd,
  start,
  end,
  pan,
  panByStep,
  zoom,
  toScreen,
  intervalToScreen,
  applyInertia,
  screenWidth,
  transformDuration,
} = viewportController

const { gateHeight, gateGap, gatesTopMargin, flightBottomMargin } = Constants

const isDragging = ref(false)
const disableTransition = ref(false)
const cssTransition = computed(() =>
  isDragging.value || disableTransition.value ? 'none' : `all ease ${transformDuration}ms`,
)

onMounted(() => setTimeout(() => (disableTransition.value = false)))

const flightsByGate = computed(() =>
  flights.value.reduce(
    (agg, flight) => {
      const { gate } = flight

      if (!agg[gate]) {
        agg[gate] = []
      }

      agg[gate].push(flight)

      return agg
    },
    {} as { [gate: number]: Flight[] },
  ),
)

const visibleFlightsByGate = ref(
  _.mapValues(flightsByGate.value, (gateFlights) => {
    const firstIndex = findFirst(gateFlights, renderStart.value)
    const lastIndex = findLast(gateFlights, renderEnd.value)

    if (firstIndex === null || lastIndex === null) return []

    return gateFlights.slice(firstIndex, lastIndex + 1)
  }),
)

watch([renderStart, renderEnd], () => {
  visibleFlightsByGate.value = _.mapValues(flightsByGate.value, (gateFlights) => {
    const firstIndex = findFirst(gateFlights, renderStart.value)
    const lastIndex = findLast(gateFlights, renderEnd.value)

    if (firstIndex === null || lastIndex === null) return []

    return gateFlights.slice(firstIndex, lastIndex + 1)
  })
})

const getFlightTop = (gateId: number) => {
  const gate = gates.value.find((gate) => gate.id === gateId)
  if (!gate) return 0
  return gateHeight + (gateHeight + gateGap) * gate.order - flightBottomMargin
}
</script>

<template>
  <Viewport
    :class="$style.viewport"
    :pan="pan"
    :pan-by-step="panByStep"
    :zoom="zoom"
    :apply-inertia="applyInertia"
    v-model:width="screenWidth"
    @is-dragging="isDragging = $event"
  >
    <div>
      <div :class="$style.gatesContainer" :style="{ marginTop: `${gatesTopMargin}px` }">
        <!-- <Gate
          v-for="gate in gates"
          :key="gate.name"
          :gate="gate"
          :viewport-controller="viewportController"
          :css-transition="cssTransition"
        /> -->
      </div>
      <div
        :class="$style.surface"
        :style="{
          left: `${-intervalToScreen(start - surfaceStart)}px`,
          // transform: `translateX(${-intervalToScreen(start - surfaceStart)}px)`,
          width: `${intervalToScreen(surfaceEnd - surfaceStart)}px`,
        }"
      >
        <!-- <TimeRuler
          :surface-start="surfaceStart"
          :surface-end="surfaceEnd"
          :viewport-controller="viewportController"
          :css-transition="cssTransition"
        /> -->
        <EVA
          :surface-start="surfaceStart"
          :surface-end="surfaceEnd"
          :viewport-controller="viewportController"
          :css-transition="cssTransition"
        />
        <!-- <template v-for="gate in gates">
          <Flights
            :flights="visibleFlightsByGate[gate.id]"
            :surface-start="surfaceStart"
            :surface-end="surfaceEnd"
            :viewport-controller="viewportController"
            :css-transition="cssTransition"
            :getFlightTop="getFlightTop"
          />
        </template> -->
      </div>
    </div>
  </Viewport>
</template>

<style lang="scss" module>
.viewport {
  width: 100%;
  height: 900px;
}

.gatesContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
}

.surface {
  position: absolute;
  height: 100%;
  transition: v-bind(cssTransition);
  z-index: 2;
}
</style>
