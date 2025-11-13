<script setup lang="ts">
import { addMonths, parse } from 'date-fns'
import { Badge } from 'primevue'
import { ref, watch } from 'vue'
import type { TViewportController } from '../Viewport/types'
import EvaIcon from './eva.svg'
import { hash } from './utils'

const { surfaceStart, surfaceEnd, viewportController, cssTransition } = defineProps<{
  surfaceStart: number
  surfaceEnd: number
  viewportController: TViewportController
  cssTransition: string
}>()

const { renderStart, renderEnd, toScreen, intervalToScreen, screenWidth, zoomLevel, zoomFactor } =
  viewportController

type Item = {
  date: Date
  displayAt?: Date
  children?: Item[]
  top?: number
}

const MIN_WIDTH = 28

const screenMonth = ref(0)
watch(
  [zoomLevel, screenWidth],
  () => (screenMonth.value = intervalToScreen(30 * 24 * 60 * 60 * 1000)),
)
const data: Item[] = [
  '01.01.24',
  '05.01.24',
  '01.02.24',
  '01.01.25',
  '05.01.25',
  '06.01.25',
  '12.01.25',
  '20.01.25',
  '23.01.25',
  '01.02.25',
  '05.02.25',
  '25.03.25',
  '01.04.25',
  '03.04.25',
  '07.04.25',
  '16.04.25',
  '18.04.25',
  '22.04.25',
  '01.05.25',
  '05.05.25',
  '16.05.25',
]
  .map((s) => parse(s, 'dd.MM.yy', new Date()))
  .map((d) => ({ date: addMonths(d, 3) }))

const groupData = (minWidth: number): Item[] => {
  if (!data.length) return []
  const result: Item[] = []
  let chunk = [data[0]]

  const flush = () => {
    if (chunk.length === 1) {
      result.push(chunk[0])
    } else {
      result.push({
        date: new Date((+chunk[0].date + +chunk[chunk.length - 1].date) / 2),
        children: chunk,
      })
    }
  }

  for (let i = 1; i < data.length; i++) {
    if (intervalToScreen(+data[i].date - +chunk[chunk.length - 1].date) < minWidth) {
      chunk.push(data[i])
    } else {
      flush()
      chunk = [data[i]]
    }
  }
  flush()
  return result
}

const ungroupItem = (item: Item): Item[] => {
  if (!item.children) return [item]
  const indices: number[] = []
  const result: Item[] = []
  console.log(1)
  for (let i = 0; i < item.children.length - 1; i++) {
    if (
      intervalToScreen(Math.abs(+item.children[i + 1].date - +item.children[i].date)) >= MIN_WIDTH
    ) {
      indices.push(i)
    }
  }
  console.log('indices', indices)
  if (indices.length === 0) return [item]
  for (let i = 0; i < indices.length + 1; i++) {
    const chunk = item.children.slice(
      (indices[i - 1] ?? -1) + 1,
      (indices[i] ?? item.children.length - 1) + 1,
    )
    console.log('CHUNK', item, chunk, indices, i)
    if (chunk.length === 1) {
      result.push(chunk[0])
    } else {
      result.push({
        date: new Date((+chunk[0].date + +chunk[chunk.length - 1].date) / 2),
        children: chunk,
      })
    }
  }
  return result
}

const ungroupData = () => {
  return items.value.flatMap(ungroupItem)
}

const items = ref(data)

const theItems = ref(data)

const itemContainsCloserItem = (item: Item, closerItem: Item) => {
  return (
    (!!item.children &&
      !closerItem.children &&
      item.children.some((child) => child.date === closerItem.date)) ||
    (!!closerItem.children &&
      closerItem.date !== item.date &&
      item.children?.some((itemChild) =>
        closerItem.children?.some((closerItemChild) => itemChild.date === closerItemChild.date),
      ))
  )
}

const addHash = (a: Item[]) => a.map((item) => ({ ...item, hash: hash(item) }))

watch(
  [screenWidth, zoomLevel],
  ([newScreenWidth, newZoomLevel], [oldScreenWidth, oldZoomLevel]) => {
    const itemsThis = addHash(groupData(MIN_WIDTH))
    const itemsCloser = addHash(
      groupData(MIN_WIDTH / Math.exp(zoomFactor)).map((item) => ({
        ...item,
        top: 2,
      })),
    )
    const nextItems = itemsCloser.filter(
      (closerItem) => !itemsThis.find((item) => hash(item) === hash(closerItem)),
    )
    const a = itemsThis
      .filter((item) => !!item.children)
      .flatMap((item) => {
        return nextItems
          .filter((closerItem) => itemContainsCloserItem(item, closerItem))
          .map((closerItem) => ({ ...closerItem, displayAt: item.date }))
      })
    /*
     * items.value = _.uniqBy([...itemsThis, ...itemsCloser], (item) => +item.date)
     * items.value = [...itemsThis, ...nextItems]
     */
    console.log(itemsThis, a)
    items.value = [...a, ...itemsThis].sort((a, b) => +a.date - +b.date)
  },
)
</script>

<template>
  <div :class="$style.container">
    <transition-group name="fade">
      <div
        v-for="item in items"
        :key="item.hash"
        :class="$style.item"
        :style="{
          left: `${((+(item.displayAt ?? item.date) - surfaceStart) / (surfaceEnd - surfaceStart)) * 100}%`,
          // top: `${200 + +(item.top ?? 0) * 100}px`,
          ...(item.top && { opacity: 0 }),
        }"
      >
        <div :class="$style.dateContainer">
          <div :class="$style.date">
            <!-- {{ item.children ? '' : format(item.date, 'dd.MM') }} -->
            {{ hash(item) }}
          </div>
        </div>
        <Badge v-if="item.children" :class="$style.badge" :value="item.children.length" />
        <EvaIcon />
        <!-- {{ item.children ? null : index }} -->
      </div>
    </transition-group>
  </div>
</template>

<style module>
.container {
  margin-top: 50px;
}

.item {
  display: flex;
  width: 30px;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 79px;
  color: rgb(85, 87, 98);
  font-size: 13px;
  font-weight: 500;
  border-radius: 50%;
  background: transparent;
  transform: translateX(-50%);
  /* transition: v-bind(cssTransition); */
  transition: all ease 500ms;
  /* animation: fadeOut 0.5s ease-in-out forwards; */
}

@keyframes fadeOut {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dateContainer {
  position: relative;
}

.date {
  position: absolute;
  transform: rotate(-90deg);
  bottom: 0;
  margin-bottom: 4px;
  transform: translateY(50%) rotate(-90deg);
  transform-origin: 0 50%;
}

.badge {
  position: absolute;
  top: 0;
  transform: translateY(-100%);
  margin-top: 60px;
  background: red;
  border-radius: 100px;
}
</style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all ease 500ms;
}
.fade-enter-from, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
