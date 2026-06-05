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
  import mapboxgl from 'mapbox-gl'
  import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
  import 'mapbox-gl/dist/mapbox-gl.css'

  const mapContainer = useTemplateRef('mapContainer')

  const map = ref<mapboxgl.Map | null>(null)

  onMounted(() => {
    if (mapContainer.value) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
      map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0],
        zoom: 2,
      })
    }
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
    }
  })

</script>
