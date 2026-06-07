<template>
  <v-sheet
    class="
      selection-info-wrap
      fixed
      z-1
      left-4
      bottom-6
      h-60
      w-full
      max-w-100
      p-4
      bg-white/90
      dark:bg-[#212121]/90
      border
      border-gray-300
      dark:border-gray-600
      shadow-lg
      backdrop-blur-sm
      max-[450px]:left-0
      max-[450px]:right-0
      max-[450px]:bottom-0
      max-[450px]:max-w-none
      max-[450px]:w-full
    "
    elevation="2"
    rounded
  >
    <div v-if="props.isFetching" class="h-4 w-full absolute top-0 left-0">
      <v-progress-linear color="primary" indeterminate />
    </div>

    <!-- loading overlay -->
    <div
      v-if="props.isFetching"
      class="absolute inset-0 bg-gray-200/50 dark:bg-[#212121]/50 z-2"
    />

    <div v-if="props.hasData" class="h-full w-full">
      <slot />
    </div>

    <div v-else class="h-full w-full flex items-center justify-center">
      <p class="text-sm text-gray-300">Click or tap on the map to see data</p>
    </div>

  </v-sheet>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    hasData?: boolean
    isFetching?: boolean
  }>()
</script>
