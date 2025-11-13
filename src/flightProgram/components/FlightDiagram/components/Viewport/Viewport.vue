<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  pan: (screenDelta: number) => void
  panByStep: (by: number) => void
  zoom: (by: number, screenCenter: number) => void
  applyInertia: () => void
}>()

const { pan, panByStep, zoom, applyInertia } = props

const width = defineModel<number>('width', { default: 0 })

const lastDragX = ref<number | null>(null)
const lastDragTime = ref<number | null>(null)

const elRef = useTemplateRef<HTMLElement>('elRef')

const emit = defineEmits<{
  (e: 'isDragging', value: boolean): void
}>()

watch(elRef, () => {
  if (!elRef.value) return
  new ResizeObserver((entries) => (width.value = entries[0]?.contentRect.width ?? 0)).observe(elRef.value)
})

const handleWheel = (e: WheelEvent) => {
  const direction = Math.sign(e.deltaY)

  if (e.shiftKey) {
    // emit('isDragging', true)
    panByStep(direction)
  } else {
    const screenCenter = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().x
    zoom(direction, screenCenter)
  }
}

const handlePointerDown = (e: PointerEvent) => {
  e.preventDefault()
  e.stopPropagation()

  lastDragX.value = e.clientX
  lastDragTime.value = Date.now()
  elRef.value?.setPointerCapture(e.pointerId)
  emit('isDragging', true)
}

const handlePointerMove = (e: PointerEvent) => {
  if (lastDragX.value === null || lastDragTime.value === null) return

  pan(e.clientX - lastDragX.value)

  lastDragX.value = e.clientX
  lastDragTime.value = Date.now()
}

const handlePointerUp = (e: PointerEvent) => {
  elRef.value?.releasePointerCapture(e.pointerId)
  emit('isDragging', false)
  e.preventDefault()
  e.stopPropagation()

  if (lastDragX.value !== null && lastDragTime.value !== null) {
    if (Date.now() !== lastDragTime.value) {
      applyInertia()
    }
  }

  lastDragX.value = null
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
    ref="elRef"
  >
    <slot />
  </div>
</template>

<style module>
.container {
  position: relative;
  overflow: hidden;
  user-select: none;
}
</style>
