import { useRouteQuery } from '@vueuse/router'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { DEFAULT_ROUTE_LAT, DEFAULT_ROUTE_LNG, DEFAULT_ROUTE_ZOOM, DEFAULT_SYNC_DEBOUNCE, useMapStore } from '@/entities/map'
import { useDebounced } from '@/shared/lib/debounce'
import { routeTransformNumber } from '@/shared/route-transformers'

export function useRouteSyncedCoords () {
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

  const {
    debounced: debouncedLat,
  } = useDebounced({
    valueRef: lat,
    timeout: DEFAULT_SYNC_DEBOUNCE,
    onUpdate: syncViewportToRoute,
  })

  const {
    debounced: debouncedLng,
  } = useDebounced({
    valueRef: lng,
    timeout: DEFAULT_SYNC_DEBOUNCE,
    onUpdate: syncViewportToRoute,
  })

  const {
    debounced: debouncedZoom,
  } = useDebounced({
    valueRef: zoom,
    timeout: DEFAULT_SYNC_DEBOUNCE,
    onUpdate: syncViewportToRoute,
  })

  router.isReady().then(() => {
    if (isRouteViewportReady()) {
      syncViewportToStore()
    }
  })

  return {
    lat: debouncedLat,
    lng: debouncedLng,
    zoom: debouncedZoom,
  }
}
