export function getUvColor (uvIndex: number) {
  if (uvIndex < 0) {
    return '#000000'
  }
  if (uvIndex < 2) {
    return '#3EA72D'
  }
  if (uvIndex < 6) {
    return '#FFF300'
  }
  if (uvIndex < 8) {
    return '#F18B00'
  }
  if (uvIndex < 11) {
    return '#E53210'
  }
  return '#B567A4'
}
