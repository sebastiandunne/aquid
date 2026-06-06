<template>
  <div class="map-ui-wrap h-full w-full">
    <MapBoxMap search-enabled />
    <SelectionInfoWidget :data="data" :is-fetching="isFetching" />
  </div>
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import { storeToRefs } from 'pinia'
  import SelectionInfoWidget from '@/components/SelectionInfoWidget.vue'
  import {
    useMapStore,
    useRouteSyncedCoords,
  } from '@/entities/map'
  import { uvQueries } from '@/entities/uv'
  import MapBoxMap from '@/widgets/MapBoxMap.vue'

  useRouteSyncedCoords()

  const { lastClicked } = storeToRefs(useMapStore())
  const { data, isFetching } = useQuery(uvQueries.getForecast(lastClicked))
</script>
