<template>
  <div>
    <q-pagination class="justify-center" v-model="current" :min="1" :max="maxPage" />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect } from 'vue'
const props = defineProps({
  variableName: {
    type: Object,
    required: true,
  },
})

const current = ref(1)
const maxPage = ref(props.variableName?.totalPages || 1)
watchEffect(() => {
  if (props.variableName?.totalPages) {
    maxPage.value = props.variableName.totalPages
  } else {
    maxPage.value = 1
  }
})

const emit = defineEmits(['pagination'])
watch(current, (newPage) => {
  emit('pagination', newPage)
})
</script>

<style></style>
