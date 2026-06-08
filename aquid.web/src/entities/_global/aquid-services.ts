import { AquidClient } from '@/shared/client/aquid-client'
import { MapboxClient } from '../../shared/client/mapbox-client'
import { AirQualityService } from '../air-quality/api/air-quality-service'
import { SearchService } from '../search/api/search-service'
import { UvService } from '../uv/api/uv-service'

export class AquidServices {
  airQuality: AirQualityService
  search: SearchService
  uv: UvService

  protected aquidClient: AquidClient
  protected mapboxClient: MapboxClient

  constructor ({
    aquidBaseUrl = import.meta.env.VITE_API_BASE_URL,
    mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    mapboxBaseUrl = import.meta.env.VITE_MAPBOX_BASE_URL,
  }: {
    aquidBaseUrl?: string
    mapboxAccessToken?: string
    mapboxBaseUrl?: string
  } = {}) {
    this.aquidClient = new AquidClient(aquidBaseUrl)
    this.mapboxClient = new MapboxClient(mapboxBaseUrl, mapboxAccessToken)

    this.airQuality = new AirQualityService(this.aquidClient)
    this.uv = new UvService(this.aquidClient)

    this.search = new SearchService(this.mapboxClient)
  }
}

export const aquidServices = new AquidServices()
