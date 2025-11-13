import { computed, ref, watch } from 'vue'

interface ViewportOptions {
  start: number
  end: number
}

export const useViewportController = (options: ViewportOptions) => {
  const maxZoom = 20
  const minZoom = -5
  const zoomFactor = 0.3
  const inertiaFactor = 1.6
  const inertiaMax = 100
  const mousePanFactor = 0.1
  const transformDuration = 500

  const zoomLevel = ref(10)

  const start = ref(options.start)
  const end = ref(options.end)

  const width = computed(() => end.value - start.value)
  const screenWidth = ref(0)

  const inertia = ref<number>(0)
  const inertiaDistance = computed(() => {
    const boundInertia =
      inertia.value > 0 ? Math.min(inertia.value, inertiaMax) : Math.max(inertia.value, -inertiaMax)
    // const inertiaValue = Math.sign(inertia.value) * inertiaMax

    // console.log('inertia distance is', boundInertia * inertiaFactor * zoomCoef.value)
    return boundInertia * inertiaFactor
  })

  const displayGap = computed(() =>
    Math.max((width.value * Math.exp(zoomFactor)) / 2, Math.abs(inertiaDistance.value)),
  )

  const renderStart = ref(start.value - displayGap.value)
  const renderEnd = ref(end.value + displayGap.value)

  watch([start, end, displayGap], () => {
    if (
      start.value - renderStart.value < displayGap.value / 2 ||
      start.value - renderStart.value > (displayGap.value * 3) / 2
    ) {
      renderStart.value = start.value - displayGap.value
    }

    if (
      renderEnd.value - end.value < displayGap.value / 2 ||
      renderEnd.value - end.value > (displayGap.value * 3) / 2
    ) {
      renderEnd.value = end.value + displayGap.value
    }
  })

  const toScreen = (x: number) => {
    return (screenWidth.value * (x - start.value)) / width.value
  }

  const fromScreen = (x: number) => {
    return start.value + (width.value * x) / screenWidth.value
  }

  const intervalFromScreen = (d: number) => {
    return (width.value * d) / screenWidth.value
  }

  const intervalToScreen = (d: number) => {
    return (d * screenWidth.value) / width.value
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
    const w = width.value
    start.value -= intervalFromScreen(screenDelta)
    end.value = start.value + w
  }

  const panByStep = (by: number) => {
    const w = width.value
    start.value -= intervalFromScreen(-mousePanFactor * screenWidth.value * by)
    end.value = start.value + w
  }

  const applyInertia = () => {
    setTimeout(() => (inertia.value = 0), transformDuration)
    pan(inertiaDistance.value)
  }

  return {
    renderStart,
    renderEnd,
    start,
    end,
    pan,
    panByStep,
    zoom,
    toScreen,
    intervalToScreen,
    applyInertia,
    screenWidth,
    transformDuration,
    zoomLevel,
    zoomFactor,
  }
}
