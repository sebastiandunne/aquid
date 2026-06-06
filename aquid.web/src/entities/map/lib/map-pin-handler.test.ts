import type { AirQualityMapLocation } from './map-pin-handler'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MapPinHandler } from './map-pin-handler'

type MockMarker = {
  lngLat: [number, number] | null
  addedTo: unknown
  removed: boolean
}

const markerState = vi.hoisted(() => ({
  instances: [] as MockMarker[],
}))

vi.mock('mapbox-gl', () => {
  class Marker {
    lngLat: [number, number] | null = null
    addedTo: unknown = null
    removed = false

    constructor () {
      markerState.instances.push(this)
    }

    setLngLat (lngLat: [number, number]) {
      this.lngLat = lngLat
      return this
    }

    addTo (map: unknown) {
      this.addedTo = map
      return this
    }

    remove () {
      this.removed = true
      return this
    }
  }

  return {
    default: {
      Marker,
    },
  }
})

describe('MapPinHandler', () => {
  beforeEach(() => {
    markerState.instances = []
  })

  function createLocation (id: number, longitude: number, latitude: number): AirQualityMapLocation {
    return {
      id,
      coordinates: {
        longitude,
        latitude,
      },
    } as AirQualityMapLocation
  }

  it('adds markers for all new locations', () => {
    const map = {}
    const handler = new MapPinHandler(map as never)

    handler.setLocations([
      createLocation(1, 10, 20),
      createLocation(2, 30, 40),
    ])

    expect(markerState.instances).toHaveLength(2)
    expect(markerState.instances[0]?.lngLat).toEqual([10, 20])
    expect(markerState.instances[0]?.addedTo).toBe(map)
    expect(markerState.instances[1]?.lngLat).toEqual([30, 40])
    expect(markerState.instances[1]?.addedTo).toBe(map)
  })

  it('updates existing marker positions and removes stale markers', () => {
    const map = {}
    const handler = new MapPinHandler(map as never)

    handler.setLocations([
      createLocation(1, 10, 20),
      createLocation(2, 30, 40),
    ])

    const firstMarker = markerState.instances[0]
    const secondMarker = markerState.instances[1]

    handler.setLocations([
      createLocation(1, 99, 77),
    ])

    expect(markerState.instances).toHaveLength(2)
    expect(firstMarker?.lngLat).toEqual([99, 77])
    expect(firstMarker?.removed).toBe(false)
    expect(secondMarker?.removed).toBe(true)
  })

  it('clears all markers from map and internal state', () => {
    const map = {}
    const handler = new MapPinHandler(map as never)

    handler.setLocations([
      createLocation(1, 10, 20),
      createLocation(2, 30, 40),
    ])

    handler.clear()

    expect(markerState.instances.every(marker => marker.removed)).toBe(true)

    handler.setLocations([
      createLocation(1, 11, 21),
    ])

    expect(markerState.instances).toHaveLength(3)
    expect(markerState.instances[2]?.lngLat).toEqual([11, 21])
    expect(markerState.instances[2]?.removed).toBe(false)
  })
})
