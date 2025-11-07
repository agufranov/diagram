<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

const maxZoom = 20
const minZoom = -10
const baseWidth = 100
const zoomFactor = 0.3
const inertiaFactor = 0.03
const inertiaMax = 100

const rnd = (x: number) => Math.random() * x
const range = (n: number) => [...Array(n).keys()]

const data: [number, number][] = [[-1000, -950]]
for (let i = 0; i < 100000; i++) {
  const end = data[data.length - 1]![1]
  data.push([end + rnd(100), end + rnd(100) + rnd(200)])
}
// const data: [number, number][] = [
//   [-40, 0],
//   [10, 20],
//   [30, 40],
// ]

const zoom = ref(10)
const zoomCoef = computed(() => Math.exp(zoom.value * zoomFactor))

const from = ref(-50)
const to = ref(from.value + baseWidth * zoomCoef.value)

const width = computed(() => to.value - from.value)

const inertiaDistance = computed(
  () => Math.min(inertia.value ?? 0, inertiaMax) * inertiaFactor * zoomCoef.value,
)

const dragStart = ref<number | null>(null)
const dragFrom = ref<number | null>(null)
const lastDragX = ref<number | null>(null)
const inertia = ref<number | null>(null)

const elRef = useTemplateRef<HTMLDivElement>('ref')

const visibleData = computed(() =>
  data.filter(
    (event) =>
      event[1] >= from.value - (width.value * Math.exp(zoomFactor)) / 2 &&
      event[0] <= to.value + (width.value * Math.exp(zoomFactor)) / 2,
  ),
)

const a = defineModel<string>('name', { default: 's' })
console.log(a.value)

const toScreen = (x: number) => {
  return ((elRef.value?.clientWidth ?? 0) * (x - from.value)) / width.value
}

const fromScreen = (x: number) => {
  return from.value + ((to.value - from.value) * x) / (elRef.value?.clientWidth ?? 0)
}

Object.assign(window, { toScreen, fromScreen })

const handleWheel = (e: WheelEvent) => {
  zoom.value = Math.min(maxZoom, Math.max(minZoom, zoom.value + Math.sign(e.deltaY)))

  const zoomCenter = fromScreen(e.clientX)
  const k = Math.exp(Math.sign(e.deltaY) * zoomFactor)

  from.value = zoomCenter + (from.value - zoomCenter) * k
  to.value = zoomCenter + (to.value - zoomCenter) * k
  a.value = zoom.value.toString()
}

const handlePointerDown = (e: PointerEvent) => {
  dragStart.value = e.clientX
  dragFrom.value = from.value
  elRef.value?.setPointerCapture(e.pointerId)
  lastDragX.value = e.clientX
}

const handlePointerMove = (e: PointerEvent) => {
  if (dragStart.value !== null && dragFrom.value !== null) {
    from.value = fromScreen(toScreen(dragFrom.value) - (e.clientX - dragStart.value))
    to.value = from.value + baseWidth * zoomCoef.value
    if (lastDragX.value !== null) {
      inertia.value = e.clientX - lastDragX.value
    }
    lastDragX.value = e.clientX
  }
}

const handlePointerUp = (e: PointerEvent) => {
  if (dragStart.value === e.clientX) {
    // inertia.value = 0
  }
  dragStart.value = null
  dragFrom.value = null
  elRef.value?.releasePointerCapture(e.pointerId)
  from.value -= inertiaDistance.value
  to.value -= inertiaDistance.value
}
</script>

<template>
  <div
    :class="$style.container"
    @wheel="handleWheel"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    :style="{
      cursor: dragStart ? 'grabbing' : 'grab',
    }"
    ref="ref"
  >
    {{ zoom }}
    {{ width.toFixed(0) }}
    {{ from.toFixed(1) }} {{ to.toFixed(1) }}
    <div
      v-for="[from, to] in visibleData"
      :key="from"
      :class="$style.event"
      :style="{
        left: `${toScreen(from)}px`,
        width: `${toScreen(to) - toScreen(from)}px`,
        transition: dragStart !== null ? 'none' : 'all ease 0.3s',
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

.eventTitle {
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  right: 0;
}
</style>
