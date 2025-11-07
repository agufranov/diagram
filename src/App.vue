<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue'
import Diagram from './Diagram.vue'

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

const isDragging = ref(false)

let isEventVisible = ref<(from: number, to: number) => boolean>(() => false)

const diagramRef = useTemplateRef<InstanceType<typeof Diagram>>('diagram')

watch(diagramRef, () => {
  isEventVisible.value = diagramRef.value?.isEventVisible ?? (() => false)
})

const visibleData = computed(() =>
  data.filter(([from, to]) => diagramRef.value?.isEventVisible(from, to) ?? false),
)

watchEffect(() => {
  console.log(visibleData.value)
})
</script>

<template>
  <Diagram ref="diagram" @is-dragging="isDragging = $event">
    <div
      v-for="[from, to] in visibleData"
      :key="from"
      :class="$style.event"
      :style="{
        left: `${diagramRef?.toScreen(from)}px`,
        width: `${(diagramRef?.toScreen(to) ?? 0) - (diagramRef?.toScreen(from) ?? 0)}px`,
        transition: isDragging ? 'none' : 'all ease 0.3s',
      }"
    >
      <div
        :class="$style.eventTitle"
        :style="{
          left: `${Math.max(0, -(diagramRef?.toScreen?.(from) ?? 0))}px`,
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
}

.eventTitle {
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  right: 0;
}
</style>
