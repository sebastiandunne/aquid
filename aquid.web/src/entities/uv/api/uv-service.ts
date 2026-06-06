import type { LngLat } from '@/entities/map/@x/global'
import type { Dayjs } from 'dayjs'
import { BaseService } from '@/shared/services/base-service'

export class UvService extends BaseService {
  getForecast (coordinates: LngLat, date?: Dayjs) {
    const forecastPath = '/api/Ultraviolet/forecast'

    return this.client.get(forecastPath, {
      params: {
        query: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          dt: date?.toISOString(),
        },
      },
    })
  }
}
