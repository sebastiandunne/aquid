import type { components } from '@/types/aquid-schema'
import { defineStore } from 'pinia'

type AirQualityLocation = components['schemas']['AirQualityLocation']

type LocationStoreState = {
  selectedLocation: AirQualityLocation | null
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

function isAirQualityLocation (value: unknown): value is AirQualityLocation {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as AirQualityLocation).id === 'number'
    && isCoordinates((value as AirQualityLocation).coordinates)
  )
}

function getStoredLocation (): AirQualityLocation | null {
  const raw = localStorage.getItem(LOCATION_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!isAirQualityLocation(parsed)) {
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
      this.selectedLocation = location
      saveLocation(location)
    },
    clearSelectedLocation () {
      this.selectedLocation = null
      saveLocation(null)
    },
  },
})
