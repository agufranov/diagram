const rnd = (x: number) => Math.random() * x
const range = (n: number) => [...Array(n).keys()]

export const data: [number, number][] = [[-1000, -950]]
for (let i = 0; i < 1_000_000; i++) {
  const end = data[data.length - 1]![1]
  const newStart = end + rnd(100)
  data.push([newStart, newStart + rnd(100) + 20])
}

// const data: [number, number][] = [
//   [-40, 0],
//   [10, 20],
//   [30, 40],
// ]
