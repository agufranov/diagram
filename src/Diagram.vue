<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { usePanZoom } from './usePanZoom'

type ReturnType<F> = F extends (...args: infer A) => infer R ? R : never

// const props = defineProps<{ handler: ReturnType<typeof usePanZoom> }>()

const lastDragX = ref<number | null>(null)

const elRef = useTemplateRef<HTMLElement>('ref')

const {
  from,
  to,
  showFrom,
  showTo,
  zoomLevel,
  inertiaDistance,
  zoom,
  pan,
  panByStep,
  toScreen,
  fromScreen,
} = usePanZoom(elRef)

defineExpose({ toScreen })

const emit = defineEmits<{
  (e: 'isDragging', value: boolean): void
  (e: 'showBoundsChange', value: { showFrom: number; showTo: number }): void
}>()

watch(
  [showFrom, showTo],
  () => emit('showBoundsChange', { showFrom: showFrom.value, showTo: showTo.value }),
  { immediate: true },
)

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
  emit('isDragging', true)
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
  emit('isDragging', false)
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
    <slot />
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
</style>
