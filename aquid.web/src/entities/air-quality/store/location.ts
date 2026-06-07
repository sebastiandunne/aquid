import type { AirQualityLocation } from '../model/location'
import { defineStore } from 'pinia'

type LocationMeta = {
  time: number
  data: AirQualityLocation
}

type LocationStoreState = {
  selectedLocation: LocationMeta | null
}

const LOCATION_STORAGE_KEY = 'aquid.air-quality.selected-location'

function isCoordinates (value: unknown): value is AirQualityLocation['coordinates'] {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as AirQualityLocation['coordinates']).longitude === 'number'
    && typeof (value as AirQualityLocation['coordinates']).latitude === 'number'
  )
}

function isLocationMeta (value: unknown): value is LocationMeta {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as LocationMeta).time === 'number'
    && isCoordinates((value as LocationMeta).data.coordinates)
  )
}

function getStoredLocation (): LocationMeta | null {
  const raw = localStorage.getItem(LOCATION_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!isLocationMeta(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function saveLocation (location: AirQualityLocation | null) {
  if (!location) {
    localStorage.removeItem(LOCATION_STORAGE_KEY)
    return
  }

  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
}

export const useLocationStore = defineStore('location', {
  state: (): LocationStoreState => ({
    selectedLocation: getStoredLocation(),
  }),
  actions: {
    setSelectedLocation (location: AirQualityLocation) {
      this.selectedLocation = {
        time: Date.now(),
        data: location,
      }
      saveLocation(location)
    },
    clearSelectedLocation () {
      this.selectedLocation = null
      saveLocation(null)
    },
  },
})
