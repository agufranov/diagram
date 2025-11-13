<script setup lang="ts">
import { addMonths, endOfYear, format, startOfYear } from 'date-fns'
import { ru } from 'date-fns/locale'
import { computed, ref, watch } from 'vue'
import type { TViewportController } from '../Viewport/types'

const { surfaceStart, surfaceEnd, viewportController, cssTransition } = defineProps<{
  surfaceStart: number
  surfaceEnd: number
  viewportController: TViewportController
  cssTransition: string
}>()

const { renderStart, renderEnd, toScreen, intervalToScreen, screenWidth, zoomLevel, zoomFactor } = viewportController

const screenMonth = ref(0)
watch([zoomLevel, screenWidth], () => (screenMonth.value = intervalToScreen(30 * 24 * 60 * 60 * 1000)), {
  immediate: true,
})

const startTime = computed(() => startOfYear(renderStart.value))
const endTime = computed(() => endOfYear(renderEnd.value))

const ticks = ref<number[]>([])

const getLeft = (value: number) => `${(100 * (value - surfaceStart)) / (surfaceEnd - surfaceStart)}%`

watch(
  screenMonth,
  () => {
    let tick = +startTime.value
    ticks.value = []
    console.log('screenMonth', screenMonth.value)
    while (tick < +endTime.value) {
      ticks.value.push(tick)
      if (40 <= screenMonth.value) {
        tick = +addMonths(tick, 1)
      } else if (20 <= screenMonth.value && screenMonth.value < 40) {
        tick = +addMonths(tick, 3)
      } else {
        tick = +addMonths(tick, 12)
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <transition name="fade">
    <div v-if="60 <= screenMonth" :key="2" :class="$style.container">
      <div v-for="tick in ticks" :key="tick" :class="$style.tick" :style="{ left: getLeft(tick) }">
        {{ format(tick, 'LLLL', { locale: ru }) }}
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div v-if="40 < screenMonth && screenMonth < 60" :key="3" :class="$style.container">
      <div v-for="tick in ticks" :key="tick" :class="$style.tick" :style="{ left: getLeft(tick) }">
        {{ format(tick, 'LLL', { locale: ru }) }}
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div v-if="20 <= screenMonth && screenMonth < 40" :key="3" :class="$style.container">
      <div v-for="tick in ticks" :key="tick" :class="$style.tick" :style="{ left: getLeft(tick) }">
        {{ format(tick, 'LLLL', { locale: ru }) }}
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div v-if="screenMonth < 20" :key="3" :class="$style.container">
      <div v-for="tick in ticks" :key="tick" :class="$style.tick" :style="{ left: getLeft(tick) }">
        {{ format(tick, 'yyyy', { locale: ru }) }}
      </div>
    </div>
  </transition>
</template>

<style module>
.container {
  padding-top: 6px;
  color: rgb(85, 87, 98);
  font-size: 14px;
  position: absolute;
  inset: 0;
}

.tick {
  position: absolute;
  transform: translateX(-50%);
  will-change: left;
  transition: v-bind(cssTransition);
}
</style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms;
}
.fade-enter-from, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
