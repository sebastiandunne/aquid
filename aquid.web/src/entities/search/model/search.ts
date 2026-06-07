export interface MapboxCountryContext {
  id?: string
  name: string
  country_code: string
  country_code_alpha_3: string
}

export interface MapboxRegionContext {
  id?: string
  name: string
  region_code: string
  region_code_full: string
}

export interface MapboxPlaceContext {
  id?: string
  name: string
}

export interface MapboxSuggestion {
  name: string
  mapbox_id: string
  feature_type: string
  address?: string
  full_address?: string
  place_formatted: string
  context: {
    country?: MapboxCountryContext
    region?: MapboxRegionContext
    place?: MapboxPlaceContext
  }
  language: string
  maki?: string
}

export interface MapboxSuggestResponse {
  suggestions: MapboxSuggestion[]
  attribution: string
}

export interface MapboxRetrieveResponse {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      coordinates: [number, number]
      type: 'Point'
    }
    properties: {
      name: string
      mapbox_id: string
      feature_type: string
      full_address?: string
      place_formatted?: string
      coordinates: {
        longitude: number
        latitude: number
      }
    }
  }>
  attribution: string
}
