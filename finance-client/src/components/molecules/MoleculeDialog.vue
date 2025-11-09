<template>
  <div>
    <q-dialog v-model="localValue" persistent>
      <q-card :style="style">
        <q-card-section>
          <slot name="content" />
        </q-card-section>
        <q-card-actions align="right">
          <slot name="actions"> </slot>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  style: String,
})

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = newVal
  },
)
</script>

<style></style>
