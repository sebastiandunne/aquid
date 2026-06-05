import type { paths } from '@/types/aquid-schema'
import createClient, { type Client } from 'openapi-fetch'

export class AquidClient {
  protected _client: Client<paths>

  constructor (baseUrl: string) {
    this._client = createClient<paths>({
      baseUrl,
    })
  }

  get get () {
    return this._client.GET
  }

  get put () {
    return this._client.PUT
  }

  get post () {
    return this._client.POST
  }

  get patch () {
    return this._client.PATCH
  }

  get delete () {
    return this._client.DELETE
  }
}
