<script setup lang="ts">
import { ICON_SIZE } from '@development/ui-kit/config'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiRocketOutline } from '@mdi/js'
import { format } from 'date-fns'
import { Constants } from '../../constants'
import type { Flight } from '../../types'
import type { TViewportController } from '../Viewport/types'

const { flights, surfaceStart, surfaceEnd, viewportController, cssTransition, getFlightTop } = defineProps<{
  flights: Flight[]
  surfaceStart: number
  surfaceEnd: number
  viewportController: TViewportController
  cssTransition: string
  getFlightTop: (gateId: number) => number
}>()

const { toScreen, intervalToScreen } = viewportController
const { gatesTopMargin } = Constants
</script>

<template>
  <div :class="$style.eventsContainer" :style="{ marginTop: `${gatesTopMargin}px` }">
    <div
      v-for="flight in flights"
      :key="flight.start"
      :class="$style.event"
      :style="{
        left: `${((flight.start - surfaceStart) / (surfaceEnd - surfaceStart)) * 100}%`,
        width: `${((flight.end - flight.start) / (surfaceEnd - surfaceStart)) * 100}%`,
        top: `${getFlightTop(flight.gate)}px`,
        background: flight.type === 0 ? 'var(--p-color-blue-main)' : '#13B9A5',
      }"
    >
      <template v-if="intervalToScreen(flight.end - flight.start) > 40">
        <div
          :class="$style.eventTitle"
          :style="{
            left: intervalToScreen(flight.end - flight.start) < 100 ? 0 : `${Math.max(0, -toScreen(flight.start))}px`,
          }"
        >
          <div :class="$style.eventTitleInner">
            <div :class="$style.eventTitleIcon">
              <SvgIcon type="mdi" :path="mdiRocketOutline" :size="ICON_SIZE.MD" />
            </div>
            <span :class="$style.eventTitleText">
              {{ flight.name }}
            </span>
          </div>
        </div>
        <span :class="$style.eventStartDate">{{ format(flight.start, 'dd.MM') }}</span>
        <span v-if="intervalToScreen(flight.end - flight.start) > 60" :class="$style.eventEndDate">
          {{ format(flight.end, 'dd.MM') }}
        </span>
      </template>
    </div>
  </div>
</template>

<style module>
.eventsContainer {
  position: relative;
}

.event {
  position: absolute;
  display: flex;
  align-items: center;
  height: 28px;
  transform: translateY(-100%);
  border-radius: 6px;
  background: var(--p-color-blue-main);
}

.eventTitle {
  position: absolute;
  top: 50%;
  right: 0;
  padding: 0 4px;
  color: white;
  transform: translateY(-50%);
  will-change: left;
  transition: v-bind(cssTransition);
}

.eventTitleInner {
  display: flex;
  gap: 4px;
  align-items: center;
  overflow: hidden;
}

.eventTitleIcon {
  flex-shrink: 0;
}

.eventTitleText {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eventStartDate {
  left: 0;
}

.eventEndDate {
  right: 0;
}

.eventStartDate,
.eventEndDate {
  position: absolute;
  top: 0;
  transform: translateY(-100%);
  color: rgb(85, 87, 98);
  font-size: 13px;
  font-weight: 500;
}
</style>
