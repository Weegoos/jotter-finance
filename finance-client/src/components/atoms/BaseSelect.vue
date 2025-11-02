<template>
  <q-select :options="props.options" :label="props.label" outlined dense />
</template>

<script setup>
const props = defineProps({
  options: Array,
  label: String,
})
</script>

<style></style>
