import { BaseService } from '@/shared/services/base-service'

export class AirQualityService extends BaseService {
  getCountry (countryCode: string) {
    const countryPath = '/airquality/countries/{isoCountryCode}' as unknown as '/api/AirQuality/countries/{isoCountryCode}'

    return this.client.get(countryPath, {
      params: {
        path: {
          isoCountryCode: countryCode.toLowerCase(),
        },
      },
    })
  }
}
