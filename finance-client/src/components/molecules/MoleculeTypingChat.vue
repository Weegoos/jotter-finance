<template>
  <div v-html="displayed" class="prose dark:prose-invert typing-block"></div>
</template>

<script setup>
import { ref, onMounted, onUpdated } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  speed: { type: Number, default: 30 }, // интервал между шагами (мс)
  chunk: { type: Number, default: 8 },  // сколько символов добавляется за шаг
})

const displayed = ref('')

const emit = defineEmits(['update'])

onUpdated(() => {
  emit('update') // уведомляем родитель о росте текста
})

onMounted(() => {
  let i = 0

  const interval = setInterval(() => {
    displayed.value = props.text.slice(0, i)
    i += props.chunk

    if (i >= props.text.length) {
      displayed.value = props.text
      clearInterval(interval)
    }
  }, props.speed)
})
</script>

<style scoped>
.typing-block {
  transition: all 0.15s ease-out;
}


</style>
