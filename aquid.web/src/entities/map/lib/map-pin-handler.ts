import type { components } from '@/types/aquid-schema'
import mapboxgl from 'mapbox-gl'

export type AirQualityMapLocation = components['schemas']['AirQualityLocation']

const DEFAULT_MARKER_COLOR = '#3FB1CE'
const SELECTED_MARKER_COLOR = '#ff0000'

export class MapPinHandler {
  private readonly map: mapboxgl.Map
  private readonly markersByLocationKey = new Map<string, mapboxgl.Marker>()
  private readonly locationsByKey = new Map<string, AirQualityMapLocation>()
  private temporaryMarker: mapboxgl.Marker | null = null
  private selectedLocationKey: string | null = null
  private readonly handleMapClick: (event: mapboxgl.MapMouseEvent) => void

  constructor (map: mapboxgl.Map) {
    this.map = map
    this.handleMapClick = event => {
      this.selectTemporaryMarker([event.lngLat.lng, event.lngLat.lat])
    }

    this.map.on('click', this.handleMapClick)
  }

  setLocations (newLocations: AirQualityMapLocation[]) {
    const nextLocationKeys = new Set<string>()

    for (const location of newLocations) {
      const locationKey = this.getLocationKey(location)
      nextLocationKeys.add(locationKey)
      this.locationsByKey.set(locationKey, location)

      const existingMarker = this.markersByLocationKey.get(locationKey)
      if (!existingMarker) {
        const marker = this.createMarker(
          location.coordinates.longitude,
          location.coordinates.latitude,
          locationKey === this.selectedLocationKey ? SELECTED_MARKER_COLOR : DEFAULT_MARKER_COLOR,
          () => this.selectLocation(locationKey),
        )

        this.markersByLocationKey.set(locationKey, marker)
        continue
      }

      existingMarker.setLngLat([location.coordinates.longitude, location.coordinates.latitude])
    }

    for (const [locationKey, marker] of this.markersByLocationKey.entries()) {
      if (nextLocationKeys.has(locationKey)) {
        if (locationKey === this.selectedLocationKey) {
          this.setMarkerColor(marker, SELECTED_MARKER_COLOR)
        }

        continue
      }

      marker.remove()
      this.markersByLocationKey.delete(locationKey)
      this.locationsByKey.delete(locationKey)

      if (this.selectedLocationKey === locationKey) {
        this.selectedLocationKey = null
      }
    }
  }

  clear () {
    this.map.off('click', this.handleMapClick)

    this.temporaryMarker?.remove()
    this.temporaryMarker = null

    for (const marker of this.markersByLocationKey.values()) {
      marker.remove()
    }

    this.markersByLocationKey.clear()
    this.locationsByKey.clear()
    this.selectedLocationKey = null
  }

  private getLocationKey (location: AirQualityMapLocation) {
    return `location.${location.id}`
  }

  private selectLocation (locationKey: string) {
    const location = this.locationsByKey.get(locationKey)

    if (!location) {
      return
    }

    this.clearTemporaryMarker()

    if (this.selectedLocationKey === locationKey) {
      this.setMarkerColor(this.markersByLocationKey.get(locationKey), SELECTED_MARKER_COLOR)
      return
    }

    if (this.selectedLocationKey) {
      const previouslySelectedMarker = this.markersByLocationKey.get(this.selectedLocationKey)
      this.setMarkerColor(previouslySelectedMarker, DEFAULT_MARKER_COLOR)
    }

    this.selectedLocationKey = locationKey
    this.setMarkerColor(this.markersByLocationKey.get(locationKey), SELECTED_MARKER_COLOR)
  }

  private selectTemporaryMarker (lngLat: [number, number]) {
    if (this.selectedLocationKey) {
      const previouslySelectedMarker = this.markersByLocationKey.get(this.selectedLocationKey)
      this.setMarkerColor(previouslySelectedMarker, DEFAULT_MARKER_COLOR)
      this.selectedLocationKey = null
    }

    if (!this.temporaryMarker) {
      this.temporaryMarker = this.createMarker(lngLat[0], lngLat[1], SELECTED_MARKER_COLOR, () => {
        this.clearTemporaryMarker()
      })
      return
    }

    this.temporaryMarker.setLngLat(lngLat)
    this.setMarkerColor(this.temporaryMarker, SELECTED_MARKER_COLOR)
  }

  private clearTemporaryMarker () {
    this.temporaryMarker?.remove()
    this.temporaryMarker = null
  }

  private createMarker (
    longitude: number,
    latitude: number,
    color: string,
    onClick: () => void,
  ) {
    const element = this.createMarkerElement(color)

    element.addEventListener('click', event => {
      event.stopPropagation()
      onClick()
    })

    return new mapboxgl.Marker({ element })
      .setLngLat([longitude, latitude])
      .addTo(this.map)
  }

  private createMarkerElement (color: string) {
    if (globalThis.document) {
      const element = globalThis.document.createElement('div')
      this.setMarkerElementStyle(element, color)
      return element
    }

    return this.createFallbackMarkerElement(color)
  }

  private createFallbackMarkerElement (color: string) {
    const listeners = new Map<string, Set<(event: any) => void>>()
    const element = {
      style: {},
      addEventListener: (eventName: string, listener: (event: any) => void) => {
        if (!listeners.has(eventName)) {
          listeners.set(eventName, new Set())
        }

        listeners.get(eventName)?.add(listener)
      },
      removeEventListener: (eventName: string, listener: (event: any) => void) => {
        listeners.get(eventName)?.delete(listener)
      },
      dispatchEvent: (event: any) => {
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
    }

    this.setMarkerElementStyle(element as unknown as HTMLElement, color)
    return element as unknown as HTMLElement
  }

  private setMarkerColor (marker: mapboxgl.Marker | undefined, color: string) {
    if (!marker) {
      return
    }

    this.setMarkerElementStyle(marker.getElement(), color)
  }

  private setMarkerElementStyle (element: HTMLElement, color: string) {
    element.style.width = '16px'
    element.style.height = '16px'
    element.style.borderRadius = '50%'
    element.style.backgroundColor = color
    element.style.border = '2px solid white'
    element.style.boxSizing = 'border-box'
    element.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.35)'
    element.style.cursor = 'pointer'
  }
}
