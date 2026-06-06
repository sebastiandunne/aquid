import type { components } from '@/types/aquid-schema'
import mapboxgl from 'mapbox-gl'

export type AirQualityMapLocation = components['schemas']['AirQualityLocation']

export class MapPinHandler {
  private readonly map: mapboxgl.Map
  private readonly markersByLocationKey = new Map<string, mapboxgl.Marker>()
  private readonly locationsByKey = new Map<string, AirQualityMapLocation>()

  constructor (map: mapboxgl.Map) {
    this.map = map
  }

  setLocations (newLocations: AirQualityMapLocation[]) {
    const nextLocationKeys = new Set<string>()

    for (const location of newLocations) {
      const locationKey = this.getLocationKey(location)
      nextLocationKeys.add(locationKey)
      this.locationsByKey.set(locationKey, location)

      const existingMarker = this.markersByLocationKey.get(locationKey)
      if (!existingMarker) {
        const marker = new mapboxgl.Marker()
          .setLngLat([location.coordinates.longitude, location.coordinates.latitude])

        marker.addTo(this.map)
        this.markersByLocationKey.set(locationKey, marker)
        continue
      }

      existingMarker.setLngLat([location.coordinates.longitude, location.coordinates.latitude])
    }

    for (const [locationKey, marker] of this.markersByLocationKey.entries()) {
      if (nextLocationKeys.has(locationKey)) {
        continue
      }

      marker.remove()
      this.markersByLocationKey.delete(locationKey)
      this.locationsByKey.delete(locationKey)
    }
  }

  clear () {
    for (const marker of this.markersByLocationKey.values()) {
      marker.remove()
    }

    this.markersByLocationKey.clear()
    this.locationsByKey.clear()
  }

  private getLocationKey (location: AirQualityMapLocation) {
    return `location.${location.id}`
  }
}
