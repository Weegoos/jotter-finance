<template>
  <q-btn :color="color" :icon="icon" :label="label" no-caps :flat="flat" @click="emit('emitClick')">
    <slot></slot>
  </q-btn>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: '',
  },
  label: {
    type: [String, Number],
  },
  icon: {
    type: String,
    required: false,
  },
  flat: [Boolean, String],
})

const emit = defineEmits(['emitClick'])
</script>
