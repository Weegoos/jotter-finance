<template>
  <div class="grid grid-cols-2 grid-rows-1 items-center">
    <section>
      <p class="text-2xl">{{ props.sectionName }}</p>
    </section>
    <div class="flex justify-end">
      <Button :icon="'mdi-close'" dense rounded flat @emitClick="emit('emitClick')"></Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '../atoms'
const props = defineProps({
  sectionName: String,
})

const emit = defineEmits(['emitClick'])
</script>

<style></style>
