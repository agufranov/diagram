<script setup lang="ts">
import { Constants } from '../../constants'
import type { Gate } from '../../types'
import type { TViewportController } from '../Viewport/types'

const { gate, viewportController, cssTransition } = defineProps<{
  gate: Gate
  viewportController: TViewportController
  cssTransition: string
}>()

const { gateHeight, gateGap } = Constants
const { toScreen, screenWidth } = viewportController
</script>

<template>
  <div
    :class="$style.gate"
    :style="{
      height: `${gateHeight}px`,
      top: `${gate.order * (gateHeight + gateGap)}px`,
      left: `${gate.start === -Infinity ? -6 : toScreen(gate.start)}px`,
      right: `${gate.end === Infinity ? -6 : screenWidth - toScreen(gate.end)}px`,
    }"
  >
    <span
      :class="$style.gateTitle"
      :style="{
        left: `${gate.start === -Infinity ? 6 : Math.max(0, -toScreen(gate.start))}px`,
      }"
    >
      <span :style="{ overflow: 'hidden' }">
        {{ gate.name }}
      </span>
    </span>
  </div>
</template>

<style module>
.gate {
  background: #f2f2f2;
  position: absolute;
  left: 0;
  right: 0;
  border-radius: 6px;
  overflow: hidden;
  transition: v-bind(cssTransition);
  z-index: 1;
}

.gateTitle {
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(85, 87, 98);
  right: 0;
  top: 0;
  padding: 4px;
  will-change: left;
  transition: v-bind(cssTransition);
}
</style>
