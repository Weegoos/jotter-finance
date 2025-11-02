<template>
  <q-list>
    <q-item
      v-for="(item, index) in props.data"
      :key="index"
      clickable
      v-close-popup
      @click="emit('onItemClick', item)"
    >
      <q-item-section avatar>
        <q-avatar :icon="item.icon" text-color="black" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.label || 'Nothing' }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const emit = defineEmits(['onItemClick'])

const props = defineProps({
  data: {
    type: Array,
  },
})
</script>

<style></style>
