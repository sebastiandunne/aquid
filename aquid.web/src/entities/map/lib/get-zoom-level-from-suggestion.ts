import type { MapboxSuggestion } from '@/entities/search'

/**
 * Rough estimate of zoom level based on suggestion type
 */
export function getZoomLevelFromSuggestion (suggestion: MapboxSuggestion,
): number {
  if (suggestion.address) {
    return 16
  }
  if (suggestion.context.place) {
    return 14
  }
  if (suggestion.context.region) {
    return 12
  }
  if (suggestion.context.country) {
    return 4
  }
  return 10
}
