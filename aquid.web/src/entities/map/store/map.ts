import { defineStore } from 'pinia'
import { DEFAULT_ROUTE_LAT, DEFAULT_ROUTE_LNG, DEFAULT_ROUTE_ZOOM, type LastClicked, type LngLat, type MapStoreState, type MapViewport } from '@/entities/map'

const VIEWPORT_STORAGE_KEY = 'aquid.map.viewport'

const DEFAULT_VIEWPORT: MapViewport = {
  center: {
    lng: DEFAULT_ROUTE_LNG,
    lat: DEFAULT_ROUTE_LAT,
  },
  zoom: DEFAULT_ROUTE_ZOOM,
  bounds: undefined,
}

function isMapViewport (obj: any): obj is MapViewport {
  return (
    obj
    && typeof obj === 'object'
    && obj.center
    && typeof obj.center.lat === 'number'
    && typeof obj.center.lng === 'number'
    && typeof obj.zoom === 'number'
  )
}

function getStoredViewport (): MapViewport | null {
  const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY)

  if (!raw) {
    return null
  }

  const parsed = JSON.parse(raw)

  if (!isMapViewport(parsed)) {
    return null
  }

  return {
    center: {
      lng: parsed.center.lng,
      lat: parsed.center.lat,
    },
    zoom: parsed.zoom,
    bounds: parsed.bounds
      ? {
          northeast: {
            lng: parsed.bounds.northeast.lng,
            lat: parsed.bounds.northeast.lat,
          },
          southwest: {
            lng: parsed.bounds.southwest.lng,
            lat: parsed.bounds.southwest.lat,
          },
        }
      : undefined,
  }
}

function saveViewport (viewport: MapViewport) {
  localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport))
}

export const useMapStore = defineStore('map', {
  state: (): MapStoreState => {
    const initialViewport = getStoredViewport() ?? DEFAULT_VIEWPORT

    return {
      center: initialViewport.center as LngLat,
      zoom: initialViewport.zoom,
      bounds: initialViewport.bounds,
      lastClicked: null as LastClicked | null,
    }
  },
  actions: {
    setViewport (payload: MapViewport) {
      this.center.lat = payload.center.lat
      this.center.lng = payload.center.lng
      this.zoom = payload.zoom
      if (payload.bounds) {
        this.bounds = {
          northeast: {
            lng: payload.bounds.northeast.lng,
            lat: payload.bounds.northeast.lat,
          },
          southwest: {
            lng: payload.bounds.southwest.lng,
            lat: payload.bounds.southwest.lat,
          },
        }
      }
      saveViewport(payload)
    },
    setLastClicked (coords: LngLat) {
      this.lastClicked = {
        time: Date.now(),
        location: coords,
      }
    },
  },
})
