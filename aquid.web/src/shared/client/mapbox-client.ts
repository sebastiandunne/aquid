import type { MapboxRetrieveResponse, MapboxSuggestResponse } from '../../entities/search/model/search'
import { AquidClient } from '@/shared/client/aquid-client'

export class MapboxClient extends AquidClient {
  constructor (private readonly url: string, private readonly accessToken: string) {
    super(url)
  }

  async suggest (query: string, sessionToken: string, limit = 5): Promise<MapboxSuggestResponse> {
    const url = new URL(`${this.url}/suggest`)
    url.searchParams.set('q', query)
    url.searchParams.set('session_token', sessionToken)
    url.searchParams.set('access_token', this.accessToken)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('language', 'en')

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Mapbox suggest failed: ${response.status}`)
    }

    return response.json() as Promise<MapboxSuggestResponse>
  }

  async retrieve (id: string, sessionToken: string): Promise<MapboxRetrieveResponse> {
    const url = new URL(`${this.url}/retrieve/${encodeURIComponent(id)}`)
    url.searchParams.set('session_token', sessionToken)
    url.searchParams.set('access_token', this.accessToken)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Mapbox retrieve failed: ${response.status}`)
    }

    return response.json() as Promise<MapboxRetrieveResponse>
  }
}
