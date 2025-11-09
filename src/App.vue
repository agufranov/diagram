<script setup lang="ts">
import { computed, ref } from 'vue'
import { data } from './data'
import Diagram from './Diagram.vue'
import { usePanZoom } from './usePanZoom'
import { findFirst, findLast } from './utils'

const isDragging = ref(false)

const {
  renderStart,
  renderEnd,
  pan,
  panByStep,
  zoom,
  toScreen,
  applyInertia,
  screenWidth,
  transformDuration,
} = usePanZoom()

const visibleData = computed(() => {
  const firstIndex = findFirst(data, renderStart.value)
  const lastIndex = findLast(data, renderEnd.value)

  if (firstIndex === null || lastIndex === null) return []

  return data.slice(firstIndex, lastIndex + 1)
})
</script>

<template>
  <Diagram
    :pan="pan"
    :pan-by-step="panByStep"
    :zoom="zoom"
    :apply-inertia="applyInertia"
    v-model:width="screenWidth"
    @is-dragging="isDragging = $event"
  >
    <div
      v-for="[from, to] in visibleData"
      :key="from"
      :class="$style.event"
      :style="{
        transform: `translate(${toScreen(from)}px, -50%)`,
        width: `${toScreen(to) - toScreen(from)}px`,
        transition: isDragging ? 'none' : `all ease ${transformDuration}ms`,
      }"
    >
      <div
        :class="$style.eventTitle"
        :style="{
          left: `${Math.max(0, -toScreen(from))}px`,
        }"
      >
        Name mamamma oiuoiu
      </div>
    </div>
  </Diagram>
</template>

<style module>
.event {
  position: absolute;
  height: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: red;
  border-radius: 6px;
  will-change: transform;
}

.eventTitle {
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  right: 0;
}
</style>
