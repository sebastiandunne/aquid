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
  import { DEFAULT_ROUTE_LAT, DEFAULT_ROUTE_LNG, DEFAULT_ROUTE_ZOOM, useMapStore } from '@/entities/map'
  import {
    type Language,
    LANGUAGE_OPTIONS,
    type Theme,
    THEME_OPTIONS,
    usePreferencesStore,
  } from '@/entities/preferences'

  type MapDebugGuiState = {
    language: Language
    theme: Theme
    centerLng: number
    centerLat: number
    zoom: number
    clickLng: number | string
    clickLat: number | string
    boundsNorthEastLng?: number
    boundsNorthEastLat?: number
    boundsSouthWestLng?: number
    boundsSouthWestLat?: number
  }

  const mapStore = useMapStore()
  const preferencesStore = usePreferencesStore()
  const { center, zoom, lastClicked, bounds } = storeToRefs(mapStore)
  const { language, theme } = storeToRefs(preferencesStore)

  const guiContainer = useTemplateRef('guiContainer')

  const guiState = reactive<MapDebugGuiState>({
    language: 'en',
    theme: 'light',
    centerLng: DEFAULT_ROUTE_LNG,
    centerLat: DEFAULT_ROUTE_LAT,
    zoom: DEFAULT_ROUTE_ZOOM,
    clickLng: '-',
    clickLat: '-',
    boundsNorthEastLng: 0,
    boundsNorthEastLat: 0,
    boundsSouthWestLng: 0,
    boundsSouthWestLat: 0,
  })

  let gui: GUI | null = null
  let stopSync: (() => void) | null = null

  function formatCoord (value: number) {
    return value.toFixed(5)
  }

  function syncStateFromStore () {
    guiState.language = language.value
    guiState.theme = theme.value
    guiState.centerLng = center.value.lng
    guiState.centerLat = center.value.lat
    guiState.zoom = zoom.value
    guiState.boundsNorthEastLng = bounds?.value?.northeast.lng
    guiState.boundsNorthEastLat = bounds?.value?.northeast.lat
    guiState.boundsSouthWestLng = bounds?.value?.southwest.lng
    guiState.boundsSouthWestLat = bounds?.value?.southwest.lat

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

    const preferencesFolder = gui.addFolder('Preferences')
    const viewportFolder = gui.addFolder('Viewport')
    const clickFolder = gui.addFolder('Last Click')
    const boundsFolder = gui.addFolder('Bounds')

    preferencesFolder
      .add(guiState, 'language', [...LANGUAGE_OPTIONS])
      .name('language')
      .listen()
      .onChange((newLanguage: Language) => {
        preferencesStore.setLanguage(newLanguage)
      })

    preferencesFolder
      .add(guiState, 'theme', [...THEME_OPTIONS])
      .name('theme')
      .listen()
      .onChange((newTheme: Theme) => {
        preferencesStore.setTheme(newTheme)
      })

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

    const boundsNorthEastLngController = boundsFolder
      .add(guiState, 'boundsNorthEastLng')
      .name('northeast.lng')
      .listen()
    const boundsNorthEastLatController = boundsFolder
      .add(guiState, 'boundsNorthEastLat')
      .name('northeast.lat')
      .listen()
    const boundsSouthWestLngController = boundsFolder
      .add(guiState, 'boundsSouthWestLng')
      .name('southwest.lng')
      .listen()
    const boundsSouthWestLatController = boundsFolder
      .add(guiState, 'boundsSouthWestLat')
      .name('southwest.lat')
      .listen()

    disableControllers([
      centerLngController,
      centerLatController,
      zoomController,
      clickLngController,
      clickLatController,
      boundsNorthEastLngController,
      boundsNorthEastLatController,
      boundsSouthWestLngController,
      boundsSouthWestLatController,
    ])

    syncStateFromStore()
    stopSync = watch([language, theme, center, zoom, lastClicked, bounds], syncStateFromStore, {
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
