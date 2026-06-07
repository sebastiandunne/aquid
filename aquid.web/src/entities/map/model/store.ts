export type LngLat = {
  lng: number
  lat: number
}

export type MapBounds = {
  northeast: LngLat
  southwest: LngLat
}

export type MapViewport = {
  center: LngLat
  zoom: number
  bounds?: MapBounds
}

export type LastClicked = {
  time: number
  location: LngLat
}

export type MapStoreState = MapViewport & {
  lastClicked: LastClicked | null
}
