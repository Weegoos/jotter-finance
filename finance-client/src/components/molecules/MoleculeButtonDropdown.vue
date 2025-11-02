<template>
  <BaseButtonDropdown>
    <template #dropdown>
      <BaseList :data="props.data" @onItemClick="emit('onItemClick', $event)"></BaseList>
    </template>
  </BaseButtonDropdown>
</template>

<script setup>
import BaseButtonDropdown from '../atoms/BaseButtonDropdown.vue'
import BaseList from '../atoms/BaseList.vue'

const props = defineProps({
  data: Array,
})

const emit = defineEmits(['onItemClick'])
</script>

<style></style>
