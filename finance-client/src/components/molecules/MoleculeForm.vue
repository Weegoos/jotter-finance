<template>
  <q-form @submit.prevent="emit('submit')" @reset="emit('reset')" class="q-gutter-m">
    <slot />

    <slot name="actions">
      <Button
        v-if="mainButtonLabel"
        :class="mainButtonClass"
        :label="mainButtonLabel"
        @click="emit('mainButton')"
      />
      <Button
        v-if="moveButtonLabel"
        :class="moveButtonClass"
        :label="moveButtonLabel"
        @click="emit('moveButton')"
      />
      <!-- <Button
        v-if="additionalButtonLabel"
        icon="mdi-google"
        :label="additionalButtonLabel"
        :class="additionalButtonClass"
        @click="emit('additionalButtonClick')"
      /> -->
    </slot>
  </q-form>
</template>

<script setup>
import { Button } from '../atoms'

const emit = defineEmits(['submit', 'reset', 'loginButton', 'additionalButtonClick', 'moveButton'])

defineProps({
  mainButtonLabel: [String, Number],
  moveButtonLabel: [String, Number],
  additionalButtonLabel: [String, Number],
  mainButtonClass: {
    type: String,
    default: 'bg-violet-700 text-white w-[100%] q-mt-sm',
  },
  moveButtonClass: {
    type: String,
    default: 'text-black w-[100%] q-mt-sm',
  },
  additionalButtonClass: {
    type: String,
    default: 'text-black q-mt-sm w-[100%]',
  },
})
</script>

<style></style>
