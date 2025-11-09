import { computed, ref } from 'vue'

export const usePanZoom = () => {
  const maxZoom = 20
  const minZoom = -5
  const baseWidth = 100
  const zoomFactor = 0.3
  const inertiaFactor = 1.6
  const inertiaMax = 1000
  const mousePanFactor = 0.1
  const transformDuration = 300

  const zoomLevel = ref(10)
  const zoomCoef = computed(() => Math.exp(zoomLevel.value * zoomFactor))

  const start = ref(-50)
  const end = ref(start.value + baseWidth * zoomCoef.value)

  const width = computed(() => end.value - start.value)
  const screenWidth = ref(0)

  const inertia = ref<number>(0)
  const inertiaDistance = computed(() => {
    const inertiaValue =
      inertia.value > 0 ? Math.min(inertia.value, inertiaMax) : Math.max(inertia.value, -inertiaMax)
    // const inertiaValue = Math.sign(inertia.value) * inertiaMax

    console.log('inertia distance is', inertiaValue * inertiaFactor * zoomCoef.value)
    return inertiaValue * inertiaFactor
  })

  const displayGap = computed(() =>
    Math.max((width.value * Math.exp(zoomFactor)) / 2, Math.abs(inertiaDistance.value)),
  )

  const renderStart = computed(() => start.value - displayGap.value)
  const renderEnd = computed(() => end.value + displayGap.value)

  // const renderStart = ref(0)
  // const renderEnd = ref(0)
  // watch(
  //   [from, to, displayGap],
  //   debounce(() => {
  //     console.log('watcher')
  //     renderStart.value = from.value - displayGap.value
  //     renderEnd.value = to.value + displayGap.value
  //   }, 5),
  // )

  const toScreen = (x: number) => {
    return (screenWidth.value * (x - start.value)) / width.value
  }

  const fromScreen = (x: number) => {
    return start.value + ((end.value - start.value) * x) / screenWidth.value
  }

  const intervalFromScreen = (d: number) => {
    return ((end.value - start.value) * d) / screenWidth.value
  }

  const zoom = (by: number, screenCenter: number) => {
    const newZoomLevel = Math.min(maxZoom, Math.max(minZoom, zoomLevel.value + by))
    if (zoomLevel.value === newZoomLevel) return

    zoomLevel.value = newZoomLevel

    const zoomCenter = fromScreen(screenCenter)
    const k = Math.exp(by * zoomFactor)

    start.value = zoomCenter + (start.value - zoomCenter) * k
    end.value = zoomCenter + (end.value - zoomCenter) * k
  }

  const pan = (screenDelta: number) => {
    inertia.value = screenDelta
    start.value -= intervalFromScreen(screenDelta)
    end.value = start.value + baseWidth * zoomCoef.value
    setTimeout(() => (inertia.value = 0), transformDuration)
  }

  const panByStep = (by: number) => {
    pan(-mousePanFactor * screenWidth.value * by)
  }

  const applyInertia = () => {
    pan(inertiaDistance.value)
  }

  const isEventVisible = (eventFrom: number, eventTo: number) =>
    eventTo >= renderStart.value && eventFrom <= renderEnd.value

  return {
    renderStart,
    renderEnd,
    pan,
    panByStep,
    zoom,
    toScreen,
    applyInertia,
    screenWidth,
    transformDuration,
  }
}
