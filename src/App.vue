<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import Diagram from './Diagram.vue'
import { findFirst, findLast } from './utils'

const rnd = (x: number) => Math.random() * x
const range = (n: number) => [...Array(n).keys()]

const data: [number, number][] = [[-1000, -950]]
for (let i = 0; i < 1000000; i++) {
  const end = data[data.length - 1]![1]
  data.push([end + rnd(100), end + rnd(100) + rnd(200)])
}

// const data: [number, number][] = [
//   [-40, 0],
//   [10, 20],
//   [30, 40],
// ]

const showFrom = ref(0)
const showTo = ref(0)

const isDragging = ref(false)

let isEventVisible = ref<((from: number, to: number) => boolean) | null>(null)
let toScreen = ref<((x: number) => number) | null>(null)

const diagramRef = useTemplateRef<InstanceType<typeof Diagram>>('diagram')

watch(diagramRef, () => {
  if (!diagramRef.value || isEventVisible.value || toScreen.value) return
  toScreen.value = diagramRef.value.toScreen
})

const visibleData = computed(() => {
  const firstIndex = findFirst(data, showFrom.value)
  const lastIndex = findLast(data, showTo.value)
  return data.filter((_, i) => i >= firstIndex! && i <= lastIndex!)
})

const t = ref()
</script>

<template>
  <Diagram
    ref="diagram"
    @is-dragging="isDragging = $event"
    @show-bounds-change="((showFrom = $event.showFrom), (showTo = $event.showTo))"
    v-model:width="t"
  >
    {{ t }}
    <div
      v-for="[from, to] in visibleData"
      :key="from"
      :class="$style.event"
      :style="{
        // left: `${toScreen?.(from) ?? 0}px`,
        transform: `translate(${toScreen?.(from) ?? 0}px, -50%)`,
        width: `${(toScreen?.(to) ?? 0) - (toScreen?.(from) ?? 0)}px`,
        transition: isDragging ? 'none' : 'all ease 0.3s',
      }"
    >
      <div
        :class="$style.eventTitle"
        :style="{
          left: `${Math.max(0, -(toScreen?.(from) ?? 0))}px`,
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
