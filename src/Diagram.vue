<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { usePanZoom } from './usePanZoom'

type ReturnType<F> = F extends (...args: infer A) => infer R ? R : never

// const props = defineProps<{ handler: ReturnType<typeof usePanZoom> }>()

const lastDragX = ref<number | null>(null)

const elRef = useTemplateRef<HTMLElement>('ref')

const { showFrom, showTo, zoom, pan, panByStep, toScreen, fromScreen, applyInertia } =
  usePanZoom(elRef)

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
  const direction = Math.sign(e.deltaY)

  if (e.shiftKey) {
    panByStep(direction)
  } else {
    zoom(direction, e.clientX)
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
  lastDragX.value = null
  elRef.value?.releasePointerCapture(e.pointerId)
  applyInertia()
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
