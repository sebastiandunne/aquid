<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { useRouteQuery } from '@vueuse/router'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { DEFAULT_ROUTE_LAT, DEFAULT_ROUTE_LNG, DEFAULT_ROUTE_ZOOM } from './entities/map'
  import { useMapStore } from './entities/map/store'
  import { useDebounced } from './shared/lib/debounce'
  import { routeTransformNumber } from './shared/route-transformers'

  const mapStore = useMapStore()
  const router = useRouter()

  const routeLat = useRouteQuery('lat', '0', routeTransformNumber(3))
  const routeLng = useRouteQuery('lng', '0', routeTransformNumber(3))
  const routeZoom = useRouteQuery('zoom', '2', routeTransformNumber(2))

  const lat = computed(() => mapStore.center.lat)
  const lng = computed(() => mapStore.center.lng)
  const zoom = computed(() => mapStore.zoom)

  function isRouteViewportReady () {
    return !(
      routeLat.value === DEFAULT_ROUTE_LAT
      && routeLng.value === DEFAULT_ROUTE_LNG
      && routeZoom.value === DEFAULT_ROUTE_ZOOM
    )
  }

  function syncViewportToStore () {
    mapStore.setViewport({
      center: {
        lat: routeLat.value,
        lng: routeLng.value,
      },
      zoom: routeZoom.value,
    })
  }

  function syncViewportToRoute () {
    routeLat.value = mapStore.center.lat
    routeLng.value = mapStore.center.lng
    routeZoom.value = mapStore.zoom
  }

  useDebounced({
    valueRef: lat,
    timeout: 500,
    onUpdate: syncViewportToRoute,
  })

  useDebounced({
    valueRef: lng,
    timeout: 500,
    onUpdate: syncViewportToRoute,
  })

  useDebounced({
    valueRef: zoom,
    timeout: 500,
    onUpdate: syncViewportToRoute,
  })

  router.isReady().then(() => {
    if (isRouteViewportReady()) {
      syncViewportToStore()
    }
  })

</script>
