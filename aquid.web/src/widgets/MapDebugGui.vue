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
  import { useLocationStore } from '@/entities/air-quality'
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
    locationId: number | string
    locationName: string
    locationLocality: string
    locationCountryCode: string
    locationCountryName: string
    locationTimezone: string
    locationProvider: string
    locationCoordinatesLng: number | string
    locationCoordinatesLat: number | string
    locationSensorCount: number
    locationInstrumentCount: number
  }

  const mapStore = useMapStore()
  const locationStore = useLocationStore()
  const preferencesStore = usePreferencesStore()
  const { center, zoom, lastClicked, bounds } = storeToRefs(mapStore)
  const { selectedLocation } = storeToRefs(locationStore)
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
    locationId: '-',
    locationName: '-',
    locationLocality: '-',
    locationCountryCode: '-',
    locationCountryName: '-',
    locationTimezone: '-',
    locationProvider: '-',
    locationCoordinatesLng: '-',
    locationCoordinatesLat: '-',
    locationSensorCount: 0,
    locationInstrumentCount: 0,
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

    if (selectedLocation.value) {
      guiState.locationId = selectedLocation.value.id
      guiState.locationName = selectedLocation.value.name
      guiState.locationLocality = selectedLocation.value.locality ?? '-'
      guiState.locationCountryCode = selectedLocation.value.country.code
      guiState.locationCountryName = selectedLocation.value.country.name
      guiState.locationTimezone = selectedLocation.value.timezone
      guiState.locationProvider = selectedLocation.value.provider.name
      guiState.locationCoordinatesLng = formatCoord(selectedLocation.value.coordinates.longitude)
      guiState.locationCoordinatesLat = formatCoord(selectedLocation.value.coordinates.latitude)
      guiState.locationSensorCount = selectedLocation.value.sensors?.length ?? 0
      guiState.locationInstrumentCount = selectedLocation.value.instruments?.length ?? 0
    } else {
      guiState.locationId = '-'
      guiState.locationName = '-'
      guiState.locationLocality = '-'
      guiState.locationCountryCode = '-'
      guiState.locationCountryName = '-'
      guiState.locationTimezone = '-'
      guiState.locationProvider = '-'
      guiState.locationCoordinatesLng = '-'
      guiState.locationCoordinatesLat = '-'
      guiState.locationSensorCount = 0
      guiState.locationInstrumentCount = 0
    }

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
    const locationFolder = gui.addFolder('Selected Location')

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

    const locationIdController = locationFolder
      .add(guiState, 'locationId')
      .name('id')
      .listen()
    const locationNameController = locationFolder
      .add(guiState, 'locationName')
      .name('name')
      .listen()
    const locationLocalityController = locationFolder
      .add(guiState, 'locationLocality')
      .name('locality')
      .listen()
    const locationCountryCodeController = locationFolder
      .add(guiState, 'locationCountryCode')
      .name('country.code')
      .listen()
    const locationCountryNameController = locationFolder
      .add(guiState, 'locationCountryName')
      .name('country.name')
      .listen()
    const locationTimezoneController = locationFolder
      .add(guiState, 'locationTimezone')
      .name('timezone')
      .listen()
    const locationProviderController = locationFolder
      .add(guiState, 'locationProvider')
      .name('provider')
      .listen()
    const locationCoordinatesLngController = locationFolder
      .add(guiState, 'locationCoordinatesLng')
      .name('coordinates.lng')
      .listen()
    const locationCoordinatesLatController = locationFolder
      .add(guiState, 'locationCoordinatesLat')
      .name('coordinates.lat')
      .listen()
    const locationSensorCountController = locationFolder
      .add(guiState, 'locationSensorCount')
      .name('sensorCount')
      .listen()
    const locationInstrumentCountController = locationFolder
      .add(guiState, 'locationInstrumentCount')
      .name('instrumentCount')
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
      locationIdController,
      locationNameController,
      locationLocalityController,
      locationCountryCodeController,
      locationCountryNameController,
      locationTimezoneController,
      locationProviderController,
      locationCoordinatesLngController,
      locationCoordinatesLatController,
      locationSensorCountController,
      locationInstrumentCountController,
    ])

    syncStateFromStore()
    stopSync = watch([language, theme, center, zoom, lastClicked, bounds, selectedLocation], syncStateFromStore, {
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
