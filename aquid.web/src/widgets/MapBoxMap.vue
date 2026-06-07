<template>
  <div class="map-wrap h-full w-full">
    <MapBoxSearch
      v-if="props.searchEnabled"
      class="fixed top-4 left-4 z-1"
      :map="map"
      :token="token"
    />

    <div
      ref="mapContainer"
      class="
          map-container
          h-full
          w-full
      "
    />
  </div>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash'
  import mapboxgl from 'mapbox-gl'
  import { storeToRefs } from 'pinia'
  import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue'
  import { type AirQualityLocation, useAirQualityLocations, useLocationStore } from '@/entities/air-quality'
  import { DEFAULT_SYNC_DEBOUNCE, MapPinHandler, type MapViewport, useMapStore } from '@/entities/map'
  import { usePreferencesStore } from '@/entities/preferences'
  import MapBoxSearch from './MapBoxSearch.vue'
  import 'mapbox-gl/dist/mapbox-gl.css'

  const props = defineProps<{
    searchEnabled?: boolean
  }>()

  const token = computed(() => import.meta.env.VITE_MAPBOX_ACCESS_TOKEN)

  const mapContainer = useTemplateRef('mapContainer')

  const map = shallowRef<mapboxgl.Map | null>(null)
  const mapPinHandler = shallowRef<MapPinHandler | null>(null)
  const mapStore = useMapStore()
  const locationStore = useLocationStore()
  const preferencesStore = usePreferencesStore()

  const { bounds } = storeToRefs(mapStore)
  const { language, theme } = storeToRefs(preferencesStore)

  const {
    locations,
  } = useAirQualityLocations({
    bounds,
  })

  const syncViewportToStoreDebounced = debounce((instance: mapboxgl.Map) => {
    mapStore.setViewport(getViewportState(instance))
  }, DEFAULT_SYNC_DEBOUNCE)

  function getInitialViewportFromStore (): MapViewport {
    return {
      center: {
        lng: mapStore.center.lng,
        lat: mapStore.center.lat,
      },
      zoom: mapStore.zoom,
    }
  }

  function getViewportState (instance: mapboxgl.Map) {
    const center = instance.getCenter()

    const mapBounds = instance.getBounds()
    const northeast = mapBounds?.getNorthEast()
    const southwest = mapBounds?.getSouthWest()

    const bounds = northeast && southwest
      ? {
        northeast: {
          lng: northeast.lng,
          lat: northeast.lat,
        },
        southwest: {
          lng: southwest.lng,
          lat: southwest.lat,
        },
      }
      : undefined

    return {
      center: {
        lng: center.lng,
        lat: center.lat,
      },
      zoom: instance.getZoom(),
      bounds,
    }
  }

  function syncViewportToStore (instance: mapboxgl.Map) {
    syncViewportToStoreDebounced(instance)
  }

  function handleMove () {
    if (!map.value) {
      return
    }

    syncViewportToStore(map.value)
  }

  function handleZoom () {
    if (!map.value) {
      return
    }

    syncViewportToStore(map.value)
  }

  function handleClick (event: mapboxgl.MapMouseEvent) {
    mapStore.setLastClicked({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
    })
  }

  function bindMapEvents (instance: mapboxgl.Map) {
    instance.on('move', handleMove)
    instance.on('zoom', handleZoom)
    instance.on('click', handleClick)
  }

  function handleNewLocationSelected (location: AirQualityLocation) {
    locationStore.setSelectedLocation(location)
  }

  function syncMapLanguage (map: mapboxgl.Map, nextLanguage: string) {
    if (map.getLanguage() === nextLanguage) {
      return
    }
    map.setLanguage(nextLanguage)
  }

  function syncMapTheme (map: mapboxgl.Map, nextTheme: string) {
    const styleId = nextTheme === 'dark' ? 'mapbox/dark-v10' : 'mapbox/streets-v11'
    const styleUrl = `mapbox://styles/${styleId}`

    map.setStyle(styleUrl)
  }

  watch(locations, newLocations => {
    if (newLocations.length === 0 || !mapPinHandler.value) {
      return
    }

    mapPinHandler.value.setLocations(newLocations)
  })

  watch(language, newLanguage => {
    if (!map.value) {
      return
    }

    syncMapLanguage(map.value, newLanguage)
  })

  watch(theme, newTheme => {
    if (!map.value) {
      return
    }

    syncMapTheme(map.value, newTheme)
  })

  onMounted(() => {
    if (!mapContainer.value) {
      console.error('Map container not found')
      return
    }

    const initialViewport = getInitialViewportFromStore()

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    const newMap = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialViewport.center.lng, initialViewport.center.lat],
      zoom: initialViewport.zoom,
    })

    bindMapEvents(newMap)
    syncViewportToStore(newMap)
    syncMapLanguage(newMap, language.value)
    syncMapTheme(newMap, theme.value)

    map.value = newMap
    mapPinHandler.value = new MapPinHandler(newMap)
    mapPinHandler.value.on('newLocationSelected', handleNewLocationSelected)
    mapPinHandler.value.setLocations(locations.value)
  })

  onUnmounted(() => {
    syncViewportToStoreDebounced.cancel()

    if (mapPinHandler.value) {
      mapPinHandler.value.off('newLocationSelected', handleNewLocationSelected)
      mapPinHandler.value.clear()
      mapPinHandler.value = null
    }

    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

</script>
