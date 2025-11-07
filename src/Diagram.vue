<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

const maxZoom = 20
const minZoom = 1
const baseWidth = 100
const baseZoom = 10
const zoomFactor = 0.3

const data = [
  [-40, -20],
  [-10, 20],
  [40, 45],
]

const center = ref(0)
const width = ref(baseWidth)
const zoom = ref(baseZoom)

const from = computed(() => center.value - width.value / 2)
const to = computed(() => center.value + width.value / 2)

const dragStart = ref<number>(null)
const dragCenter = ref<number>(null)

const elRef = useTemplateRef<HTMLDivElement>('ref')

watch(zoom, () => {
  width.value = baseWidth * Math.exp((zoom.value - baseZoom) * zoomFactor)
})

const toScreen = (x: number) => {
  return ((elRef.value?.clientWidth ?? 0) * (x - from.value)) / width.value
}

const fromScreen = (x: number) => {
  return from.value + (width.value * x) / elRef.value.clientWidth
}

Object.assign(window, { toScreen, fromScreen })

const handleScroll = (e: WheelEvent) => {
  zoom.value = Math.min(maxZoom, Math.max(minZoom, zoom.value - Math.sign(e.deltaY)))
}

const handleMouseDown = (e: MouseEvent) => {
  dragStart.value = e.clientX
  dragCenter.value = center.value
}

const handleMouseMove = (e: MouseEvent) => {
  if (dragStart.value !== null && dragCenter.value !== null) {
    center.value = fromScreen(toScreen(dragCenter.value) - (e.clientX - dragStart.value))
  }
}

const handleMouseUp = () => {
  dragStart.value = null
  dragCenter.value = null
}
</script>

<template>
  <div
    :class="$style.container"
    @wheel="handleScroll"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    ref="ref"
  >
    {{ zoom }}
    {{ width.toFixed(0) }}
    {{ from }} {{ to }}
    <div
      v-for="[from, to] in data"
      :key="from"
      :class="$style.event"
      :style="{ left: `${toScreen(from)}px`, width: `${toScreen(to) - toScreen(from)}px` }"
    ></div>
  </div>
</template>

<style module>
.container {
  width: 100%;
  height: 500px;
  background: #eee;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.event {
  position: absolute;
  height: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: red;
  border-radius: 6px;
}
</style>
