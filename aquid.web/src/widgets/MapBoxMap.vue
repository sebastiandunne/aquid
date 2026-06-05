<template>
  <div
    ref="mapContainer"
    class="
        map-container
        h-full
        w-full
    "
  />
</template>

<script setup lang="ts">
  import type { MapViewport } from '@/entities/map/store'
  import mapboxgl from 'mapbox-gl'
  import { onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
  import { useMapStore } from '@/entities/map/store'
  import 'mapbox-gl/dist/mapbox-gl.css'

  const mapContainer = useTemplateRef('mapContainer')

  const map = shallowRef<mapboxgl.Map | null>(null)
  const mapStore = useMapStore()

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

    return {
      center: {
        lng: center.lng,
        lat: center.lat,
      },
      zoom: instance.getZoom(),
    }
  }

  function syncViewportToStore (instance: mapboxgl.Map) {
    mapStore.setViewport(getViewportState(instance))
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

    map.value = newMap
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

</script>
