<template>
  <div class="h-full w-full">
    <MapBoxMap />
  </div>

  <MapDebugGui />
</template>

<script lang="ts" setup>
  import { useRouteSyncedCoords } from '@/entities/map'
  import MapBoxMap from '@/widgets/MapBoxMap.vue'
  import MapDebugGui from '@/widgets/MapDebugGui.vue'

  useRouteSyncedCoords()

</script>
