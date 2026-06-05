<template>
  <div
    ref="guiContainer"
    class="map-debug-gui fixed top-2 right-2 z-index-1"
  />
</template>

<script setup lang="ts">
  import GUI from 'lil-gui'
  import { storeToRefs } from 'pinia'
  import { onMounted, onUnmounted, reactive, useTemplateRef, watch } from 'vue'
  import { DEFAULT_ROUTE_LAT, DEFAULT_ROUTE_LNG, DEFAULT_ROUTE_ZOOM } from '@/entities/map'
  import { useMapStore } from '@/entities/map/store'

  const mapStore = useMapStore()
  const { center, zoom, lastClicked } = storeToRefs(mapStore)

  const guiContainer = useTemplateRef('guiContainer')

  const guiState = reactive({
    centerLng: DEFAULT_ROUTE_LNG,
    centerLat: DEFAULT_ROUTE_LAT,
    zoom: DEFAULT_ROUTE_ZOOM,
    clickLng: '-',
    clickLat: '-',
  })

  let gui: GUI | null = null
  let stopSync: (() => void) | null = null

  function formatCoord (value: number) {
    return value.toFixed(5)
  }

  function syncStateFromStore () {
    guiState.centerLng = center.value.lng
    guiState.centerLat = center.value.lat
    guiState.zoom = zoom.value

    if (!lastClicked.value) {
      guiState.clickLng = '-'
      guiState.clickLat = '-'
      return
    }

    guiState.clickLng = formatCoord(lastClicked.value.lng)
    guiState.clickLat = formatCoord(lastClicked.value.lat)
  }

  function disableControllers (controllers: Array<{ disable: () => void }>) {
    for (const controller of controllers) controller.disable()
  }

  onMounted(() => {
    if (!guiContainer.value) {
      return
    }

    gui = new GUI({
      title: 'Map Debug',
      container: guiContainer.value,
    })

    const viewportFolder = gui.addFolder('Viewport')
    const clickFolder = gui.addFolder('Last Click')

    const centerLngController = viewportFolder
      .add(guiState, 'centerLng')
      .name('center.lng')
      .listen()
    const centerLatController = viewportFolder
      .add(guiState, 'centerLat')
      .name('center.lat')
      .listen()
    const zoomController = viewportFolder
      .add(guiState, 'zoom')
      .name('zoom')
      .listen()

    const clickLngController = clickFolder
      .add(guiState, 'clickLng')
      .name('lng')
      .listen()
    const clickLatController = clickFolder
      .add(guiState, 'clickLat')
      .name('lat')
      .listen()

    disableControllers([
      centerLngController,
      centerLatController,
      zoomController,
      clickLngController,
      clickLatController,
    ])

    syncStateFromStore()
    stopSync = watch([center, zoom, lastClicked], syncStateFromStore, {
      deep: true,
    })
  })

  onUnmounted(() => {
    stopSync?.()
    stopSync = null

    gui?.destroy()
    gui = null
  })
</script>

<style scoped>
  .map-debug-gui :deep(.lil-gui) {
    --width: 250px;
  }
</style>
