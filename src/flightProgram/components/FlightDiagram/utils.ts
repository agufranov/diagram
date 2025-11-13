export function findFirst(arr: { start: number; end: number }[], x: number) {
  if (arr.length === 0) return null

  let left = 0
  let right = arr.length - 1
  let mid = 0
  let steps = 0

  while (left <= right) {
    mid = Math.floor((left + right) / 2)

    if (arr[mid] !== undefined && arr[mid].end >= x) {
      // Проверяем предыдущий элемент (если существует)
      if (mid === 0) {
        break
      } else {
        right = mid - 1
      }
    } else {
      left = mid + 1
    }
    steps++
  }

  // console.log('findFirst steps:', steps)

  return mid
}

export function findLast(arr: { start: number; end: number }[], x: number) {
  if (arr.length === 0) return null

  let left = 0
  let right = arr.length - 1
  let mid = 0
  let steps = 0

  while (left <= right) {
    mid = Math.floor((left + right) / 2)

    if (arr[mid] !== undefined && arr[mid].start <= x) {
      // Проверяем следующий элемент (если существует)
      if (mid === arr.length - 1) {
        break
      } else {
        left = mid + 1
      }
    } else {
      right = mid - 1
    }
    steps++
  }

  // console.log('findLast steps:', steps)

  return mid
}
