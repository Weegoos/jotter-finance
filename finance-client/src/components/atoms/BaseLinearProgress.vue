<template>
  <q-linear-progress
    :value="props.progress"
    :color="color"
    :track-color="track_color"
    class="q-mt-sm"
    :size="props.size"
  >
    <slot></slot>
  </q-linear-progress>
</template>

<script setup>
const props = defineProps({
  progress: Number,
  size: String,
  color: String,
  track_color: String,
})
</script>

<style></style>
