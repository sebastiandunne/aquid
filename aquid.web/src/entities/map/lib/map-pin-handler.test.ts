import type { AirQualityMapLocation } from './map-pin-handler'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MapPinHandler } from './map-pin-handler'

type MockMarker = {
  lngLat: [number, number] | null
  addedTo: unknown
  removed: boolean
  element: HTMLElement
}

type MockMap = {
  on: (eventName: string, handler: (event: any) => void) => void
  off: (eventName: string, handler: (event: any) => void) => void
  emit: (eventName: string, event: any) => void
}

const markerState = vi.hoisted(() => ({
  instances: [] as MockMarker[],
}))

function createMockElement () {
  const listeners = new Map<string, Set<(event: any) => void>>()

  return {
    style: {},
    addEventListener (eventName: string, listener: (event: any) => void) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set())
      }

      listeners.get(eventName)?.add(listener)
    },
    removeEventListener (eventName: string, listener: (event: any) => void) {
      listeners.get(eventName)?.delete(listener)
    },
    dispatchEvent (event: { type: string, stopPropagation?: () => void }) {
      const nextEvent = event.stopPropagation
        ? event
        : {
            ...event,
            stopPropagation: () => {},
          }

      for (const listener of listeners.get(nextEvent.type) ?? []) {
        listener(nextEvent)
      }

      return true
    },
  } as HTMLElement
}

vi.mock('mapbox-gl', () => {
  class Marker {
    lngLat: [number, number] | null = null
    addedTo: unknown = null
    removed = false
    element: HTMLElement

    constructor (options?: { element?: HTMLElement, color?: string }) {
      this.element = options?.element ?? createMockElement()

      if (!options?.element) {
        this.element.style.backgroundColor = options?.color ?? '#3FB1CE'
      }

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

    getElement () {
      return this.element
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

  function clickElement (element: HTMLElement) {
    element.dispatchEvent({
      type: 'click',
      stopPropagation: () => {},
    } as Event)
  }

  function createMapMock (): MockMap {
    const listeners = new Map<string, Set<(event: any) => void>>()

    return {
      on (eventName, handler) {
        if (!listeners.has(eventName)) {
          listeners.set(eventName, new Set())
        }

        listeners.get(eventName)?.add(handler)
      },
      off (eventName, handler) {
        listeners.get(eventName)?.delete(handler)
      },
      emit (eventName, event) {
        for (const handler of listeners.get(eventName) ?? []) {
          handler(event)
        }
      },
    }
  }

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
    const map = createMapMock()
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
    const map = createMapMock()
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

  it('highlights a marker in red when clicked and clears any temporary pin', () => {
    const map = createMapMock()
    const handler = new MapPinHandler(map as never)

    handler.setLocations([
      createLocation(1, 10, 20),
      createLocation(2, 30, 40),
    ])

    map.emit('click', {
      lngLat: {
        lng: 55,
        lat: 66,
      },
    })

    const temporaryMarker = markerState.instances[2]
    expect(temporaryMarker?.lngLat).toEqual([55, 66])
    expect(temporaryMarker?.element.style.backgroundColor).toBe('#ff0000')

    const selectedMarker = markerState.instances[0]

    if (selectedMarker) {
      clickElement(selectedMarker.element)
    }

    expect(markerState.instances[0]?.element.style.backgroundColor).toBe('#ff0000')
    expect(markerState.instances[1]?.element.style.backgroundColor).toBe('#3FB1CE')
    expect(temporaryMarker?.removed).toBe(true)
  })

  it('reuses the same temporary pin on repeated empty-map clicks', () => {
    const map = createMapMock()
    const handler = new MapPinHandler(map as never)

    handler.setLocations([
      createLocation(1, 10, 20),
    ])

    map.emit('click', {
      lngLat: {
        lng: 55,
        lat: 66,
      },
    })

    const temporaryMarker = markerState.instances[1]
    expect(temporaryMarker?.lngLat).toEqual([55, 66])

    map.emit('click', {
      lngLat: {
        lng: 77,
        lat: 88,
      },
    })

    expect(markerState.instances).toHaveLength(2)
    expect(temporaryMarker?.lngLat).toEqual([77, 88])
    expect(temporaryMarker?.removed).toBe(false)
  })

  it('clears all markers from map and internal state', () => {
    const map = createMapMock()
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
