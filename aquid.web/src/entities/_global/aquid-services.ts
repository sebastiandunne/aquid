import { AquidClient } from '@/shared/client/aquid-client'
import { AirQualityService } from '../air-quality/api/air-quality-service'

export class AquidServices {
  airQuality: AirQualityService

  protected aquidClient: AquidClient

  constructor ({
    aquidBaseUrl = import.meta.env.VITE_API_BASE_URL,
  }: {
    aquidBaseUrl?: string
  } = {}) {
    this.aquidClient = new AquidClient(aquidBaseUrl)

    this.airQuality = new AirQualityService(this.aquidClient)
  }
}

export const aquidServices = new AquidServices()
