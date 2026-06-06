import type { MapBounds } from '@/entities/map/@x/air-quality'
import { BaseService } from '@/shared/services/base-service'

export class AirQualityService extends BaseService {
  getCountry (countryCode: string) {
    const countryPath = '/api/AirQuality/countries/{isoCountryCode}'

    return this.client.get(countryPath, {
      params: {
        path: {
          isoCountryCode: countryCode.toLowerCase(),
        },
      },
    })
  }

  getLocations (bounds: MapBounds) {
    const locationsPath = '/api/AirQuality/locations'

    return this.client.get(locationsPath, {
      params: {
        query: {
          ne_lat: bounds.northeast.lat,
          ne_lng: bounds.northeast.lng,
          sw_lat: bounds.southwest.lat,
          sw_lng: bounds.southwest.lng,
        },
      },
    })
  }
}
