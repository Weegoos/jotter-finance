<!-- src/components/atoms/BaseInput.vue -->
<template>
  <q-input
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    :placeholder="props.placeholder"
    :type="props.type"
    :dense="props.dense"
    :outlined="props.outlined"
    :label="props.label"
  >
    <!-- проброс слотов из родителя -->
    <template v-if="$slots.append" v-slot:append>
      <slot name="append" />
    </template>

    <template v-if="$slots.prepend" v-slot:prepend>
      <slot name="prepend" />
    </template>

    <template v-if="$slots.label" v-slot:label>
      <slot name="label" />
    </template>
  </q-input>
</template>

<script setup>
const props = defineProps({
  modelValue: [String, Number],
  placeholder: String,
  type: {
    type: String,
    default: 'text',
  },
  label: String,
  dense: {
    type: Boolean,
    default: true,
  },
  outlined: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>
