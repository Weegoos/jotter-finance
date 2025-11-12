<template>
  <q-badge :color="props.color" :text-color="props.text_color" :label="props.label" />
</template>

<script setup>
const props = defineProps({
  text_color: String,
  label: String || Number,
  color: String,
})
</script>

<style></style>
