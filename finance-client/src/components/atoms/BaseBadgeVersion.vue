<template>
  <q-badge color="secondary" text-color="white" :label="version" />
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const version = proxy.$projectVersion

console.log(version)
</script>

<style></style>
