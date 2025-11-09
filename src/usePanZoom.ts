import { computed, ref, type Ref } from 'vue'

export const usePanZoom = (elementWidth: Ref<number>) => {
  const maxZoom = 20
  const minZoom = -5
  const baseWidth = 100
  const zoomFactor = 0.3
  const inertiaFactor = 1.6
  const inertiaMax = 10000
  const mousePanFactor = 0.1
  const transformDuration = 300

  const zoomLevel = ref(10)
  const zoomCoef = computed(() => Math.exp(zoomLevel.value * zoomFactor))

  const from = ref(-50)
  const to = ref(from.value + baseWidth * zoomCoef.value)

  const width = computed(() => to.value - from.value)

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

  const showFrom = computed(() => from.value - displayGap.value)
  const showTo = computed(() => to.value + displayGap.value)

  const toScreen = (x: number) => {
    return (elementWidth.value * (x - from.value)) / width.value
  }

  const fromScreen = (x: number) => {
    return from.value + ((to.value - from.value) * x) / elementWidth.value
  }

  const intervalFromScreen = (d: number) => {
    return ((to.value - from.value) * d) / elementWidth.value
  }

  const zoom = (by: number, screenCenter: number) => {
    const newZoomLevel = Math.min(maxZoom, Math.max(minZoom, zoomLevel.value + by))
    if (zoomLevel.value === newZoomLevel) return

    zoomLevel.value = newZoomLevel

    const zoomCenter = fromScreen(screenCenter)
    const k = Math.exp(by * zoomFactor)

    from.value = zoomCenter + (from.value - zoomCenter) * k
    to.value = zoomCenter + (to.value - zoomCenter) * k
  }

  const pan = (screenDelta: number) => {
    inertia.value = screenDelta
    from.value -= intervalFromScreen(screenDelta)
    to.value = from.value + baseWidth * zoomCoef.value
    setTimeout(() => (inertia.value = 0), transformDuration)
  }

  const panByStep = (by: number) => {
    pan(-mousePanFactor * elementWidth.value * by)
  }

  const applyInertia = () => {
    pan(inertiaDistance.value)
  }

  const isEventVisible = (eventFrom: number, eventTo: number) =>
    eventTo >= showFrom.value && eventFrom <= showTo.value

  return {
    from,
    to,
    showFrom,
    showTo,
    zoomLevel,
    inertiaDistance,
    zoom,
    pan,
    panByStep,
    toScreen,
    fromScreen,
    applyInertia,
  }
}
