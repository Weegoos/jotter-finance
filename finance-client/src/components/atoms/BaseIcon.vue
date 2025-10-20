<template>
  <div class="row items-center justify-center gap-2">
    <q-img
      v-bind="$attrs"
      @click="toggleDrawer"
      :ratio="1 / 1"
      src="../../assets/Code.png"
      alt="icon"
    />
    <BadgeVersion />
  </div>
</template>

<script setup>
import { BadgeVersion } from '.'
</script>

<style></style>
