<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { usePanZoom } from './usePanZoom'

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

type ReturnType<F> = F extends (...args: infer A) => infer R ? R : never

// const props = defineProps<{ handler: ReturnType<typeof usePanZoom> }>()

const lastDragX = ref<number | null>(null)

const elRef = useTemplateRef<HTMLElement>('ref')

const {
  from,
  to,
  zoomLevel,
  inertiaDistance,
  zoom,
  pan,
  panByStep,
  toScreen,
  fromScreen,
  isEventVisible,
} = usePanZoom(elRef)

const visibleData = computed(() => data.filter(([from, to]) => isEventVisible(from, to)))

const a = defineModel<string>('name', { default: 's' })
console.log(a.value)

const handleWheel = (e: WheelEvent) => {
  if (e.shiftKey) {
    panByStep(Math.sign(e.deltaY))
  } else {
    zoom(Math.sign(e.deltaY), e.clientX)
  }
}

const handlePointerDown = (e: PointerEvent) => {
  lastDragX.value = e.clientX
  elRef.value?.setPointerCapture(e.pointerId)
}

const handlePointerMove = (e: PointerEvent) => {
  if (lastDragX.value === null) return

  pan(e.clientX - lastDragX.value)
  lastDragX.value = e.clientX
}

const handlePointerUp = (e: PointerEvent) => {
  // if (lastDragX.value === e.clientX) {
  //   // inertia.value = 0
  // }
  lastDragX.value = null
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
      cursor: lastDragX !== null ? 'grabbing' : 'grab',
    }"
    ref="ref"
  >
    {{ zoomLevel }}
    {{ from.toFixed(1) }} {{ to.toFixed(1) }}
    <div
      v-for="[from, to] in visibleData"
      :key="from"
      :class="$style.event"
      :style="{
        left: `${toScreen(from)}px`,
        width: `${toScreen(to) - toScreen(from)}px`,
        transition: lastDragX !== null ? 'none' : 'all ease 0.3s',
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
