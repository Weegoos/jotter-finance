<template>
  <q-btn-dropdown no-caps :label="label">
    <slot name="dropdown"></slot>
  </q-btn-dropdown>
</template>

<script setup>
defineProps({
  label: String,
})
</script>

<style></style>
