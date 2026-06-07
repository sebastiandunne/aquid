<template>
  <div class="map-ui-wrap h-full w-full">
    <MapBoxMap search-enabled />
    <SelectionInfoWidget :data="data" :is-fetching="isFetching" />
  </div>

  <MapDebugGui v-if="showDebugUi" />
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import { useRouteQuery } from '@vueuse/router'
  import { storeToRefs } from 'pinia'
  import SelectionInfoWidget from '@/components/SelectionInfoWidget.vue'
  import {
    useMapStore,
    useRouteSyncedCoords,
  } from '@/entities/map'
  import { uvQueries } from '@/entities/uv'
  import { routeTransformBoolean } from '@/shared/route-transformers'
  import MapBoxMap from '@/widgets/MapBoxMap.vue'
  import MapDebugGui from '@/widgets/MapDebugGui.vue'

  const showDebugUi = useRouteQuery('debug', 'false', routeTransformBoolean())

  useRouteSyncedCoords()

  const { lastClicked } = storeToRefs(useMapStore())
  const { data, isFetching } = useQuery(uvQueries.getForecast(lastClicked))
</script>
