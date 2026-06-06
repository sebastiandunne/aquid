<template>
  <v-progress-circular
    v-if="props.uvIndex === undefined"
    color="primary"
    indeterminate
  />

  <v-avatar
    v-else
    :color="getUvColor(props.uvIndex)"
    size="32"
  >
    <p class="text-sm font-semibold">{{ uvIndexText }}</p>
  </v-avatar>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { getUvColor } from '@/entities/uv'

  // Uv index indicator
  // Circle with color corresponding to UV index, and text showing the index value
  // Text inside is formatted to show 1 decimal place (through useI18n().n)

  const { n } = useI18n()

  const props = defineProps<{
    uvIndex: number | undefined
  }>()

  const uvIndexText = computed(() => props.uvIndex === undefined ? '' : n(props.uvIndex, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))

</script>
