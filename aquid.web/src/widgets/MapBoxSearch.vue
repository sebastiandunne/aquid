<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="searchText"
    class="
      max-[450px]:left-2
      max-[450px]:right-2
      min-[450px]:min-w-97
    "
    clearable
    density="compact"
    hide-details
    item-title="name"
    :items="suggestions"
    label="Search locations"
    :loading="isFetching"
    no-filter
    return-object
    variant="solo"
    @click:clear="resetSession"
    @update:model-value="onSelect"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item
        v-bind="itemProps"
        :subtitle="(item.place_formatted)"
      />
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
  import type { MapboxSuggestion } from '@/entities/search'
  import { useQuery } from '@tanstack/vue-query'
  import { debounce } from 'lodash'
  import { computed, ref, watch } from 'vue'
  import { aquidServices } from '@/entities/_global/aquid-services'
  import { getZoomLevelFromSuggestion, useMapStore } from '@/entities/map'
  import { searchQueries } from '@/entities/search'

  const props = defineProps<{
    token: string
    map: mapboxgl.Map | null
  }>()

  const mapStore = useMapStore()

  const searchText = ref('')
  const debouncedSearchText = ref('')
  const selected = ref<MapboxSuggestion | null>(null)
  const sessionToken = ref(crypto.randomUUID())

  watch(searchText, debounce((val: string) => {
    debouncedSearchText.value = val
  }, 300))

  const { isFetching, data } = useQuery(searchQueries.suggest(debouncedSearchText, sessionToken))

  const suggestions = computed(() => data.value?.suggestions ?? [])

  function resetSession () {
    sessionToken.value = crypto.randomUUID()
    selected.value = null
  }

  async function onSelect (suggestion: MapboxSuggestion | null) {
    if (!suggestion || !props.map) return

    const result = await aquidServices.search.retrieve(suggestion.mapbox_id, sessionToken.value)
    sessionToken.value = crypto.randomUUID()

    const feature = result.features[0]
    if (!feature) return

    const { longitude, latitude } = feature.properties.coordinates
    props.map.flyTo({
      center: [longitude, latitude],
      zoom: getZoomLevelFromSuggestion(suggestion),
      essential: true,
    })
    mapStore.setLastClicked({ lng: longitude, lat: latitude })
  }
</script>
