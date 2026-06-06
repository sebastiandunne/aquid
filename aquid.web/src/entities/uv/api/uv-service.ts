import type { LngLat } from '@/entities/map/@x/global'
import type { Dayjs } from 'dayjs'
import { BaseService } from '@/shared/services/base-service'

export class UvService extends BaseService {
  async getForecast (coordinates: LngLat, date?: Dayjs) {
    const forecastPath = '/api/Ultraviolet/forecast'

    const response = await this.client.get(forecastPath, {
      params: {
        query: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          dt: date?.toISOString(),
        },
      },
    })

    return response
  }
}
