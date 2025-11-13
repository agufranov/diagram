import { ref } from 'vue'
import type { Flight, Gate } from './types'

const rnd = (x: number) => Math.random() * x
const range = (n: number) => [...Array(n).keys()]

export const gates = ref<Gate[]>([
  { id: 0, start: +new Date('2024/05/01'), end: Infinity, name: 'НЭМ', order: 0 },
  { id: 1, start: -Infinity, end: +new Date('2026/10/01'), name: 'УУМ', order: 1 },
  { id: 2, start: -Infinity, end: +new Date('2025/10/28'), name: 'ШМ', order: 2 },
  { id: 3, start: +new Date('2025/11/01'), end: Infinity, name: 'ШМ', order: 2 },
])

export const realData: Flight[] = [
  {
    start: +new Date('2024/11/01'),
    end: +new Date('2025/05/12'),
    name: 'Союз РОС-17 №227 215 (163)',
    type: 0,
    gate: 0,
  },
  {
    start: +new Date('2025/07/01'),
    end: +new Date('2025/10/23'),
    name: 'Союз РОС-19 №229 235 (168)',
    type: 0,
    gate: 0,
  },
  {
    start: +new Date('2025/01/15'),
    end: +new Date('2025/03/18'),
    name: 'Союз РОС-19 №229 235 (168)',
    type: 0,
    gate: 1,
  },
  {
    start: +new Date('2025/04/02'),
    end: +new Date('2025/09/25'),
    name: 'Союз РОС-19 №229 235 (168)',
    type: 0,
    gate: 1,
  },
  {
    start: +new Date('2025/10/08'),
    end: +new Date('2026/03/01'),
    name: 'Союз РОС-19 №229 235 (168)',
    type: 0,
    gate: 1,
  },
  {
    start: +new Date('2024/08/15'),
    end: +new Date('2025/04/24'),
    name: 'Прогресс РОС-03М №403 35Р (191)',
    type: 1,
    gate: 2,
  },
  {
    start: +new Date('2025/04/28'),
    end: +new Date('2025/10/23'),
    name: 'Прогресс РОС-05М №403 37Р (180)',
    type: 1,
    gate: 2,
  },
]

const day = 86_400_000
const month = 30 * day
const data: Flight[] = []
const START = +new Date('01.01.2000')
const END = +new Date('01.01.2100')
let start = START
let end = start
while (end < END) {
  end = start + rnd(0.7 * day) + 0.7 * day
  data.push({
    start,
    end,
    name: 'Прогресс РОС-05М №403 37Р (180)',
    type: Math.floor(rnd(2)) as 0 | 1,
    gate: Math.floor(rnd(3)),
  })
  start = end + rnd(0.5 * day) + 0.2 * day
}
console.log('data', data)

// export const flights = ref(realData)
export const flights = ref(data)
