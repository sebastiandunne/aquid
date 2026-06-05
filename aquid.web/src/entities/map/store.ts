import { defineStore } from 'pinia'
import { DEFAULT_ROUTE_LAT, DEFAULT_ROUTE_LNG, DEFAULT_ROUTE_ZOOM } from '@/entities/map'

export type LngLat = {
  lng: number
  lat: number
}

export type MapViewport = {
  center: LngLat
  zoom: number
}

export type MapStoreState = MapViewport & {
  lastClicked: LngLat | null
}

const VIEWPORT_STORAGE_KEY = 'aquid.map.viewport'

const DEFAULT_VIEWPORT: MapViewport = {
  center: {
    lng: DEFAULT_ROUTE_LNG,
    lat: DEFAULT_ROUTE_LAT,
  },
  zoom: DEFAULT_ROUTE_ZOOM,
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
      lastClicked: null as LngLat | null,
    }
  },
  actions: {
    setViewport (payload: MapViewport) {
      this.center.lat = payload.center.lat
      this.center.lng = payload.center.lng
      this.zoom = payload.zoom
      saveViewport(payload)
    },
    setLastClicked (coords: LngLat) {
      this.lastClicked = coords
    },
  },
})
