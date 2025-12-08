<template>
  <div
    :class="{
      'fixed fixed-center w-[50%]': isSystem,
      'w-[80%] flex flex-col justify-self-center h-full ': !isSystem,
    }"
    class="rounded-xl shadow-md  overflow-hidden"
  >
    <!-- Сообщения с прокруткой -->
    <div
      ref="chatWindow"
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
      style="max-height: 100vh"
    >
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <q-chat-message
          v-if="msg.role !== 'system'"
          :name="msg.role === 'user' ? name : 'Paida AI-Ассистент'"
          :sent="msg.role === 'user'"
          :avatar-color="msg.role === 'user' ? 'primary' : 'blue-grey-5'"
          class="mb-2 max-w-[70%]"
        >
          <div v-html="parseMarkdown(msg.content)" class="prose dark:prose-invert"></div>
        </q-chat-message>

        <!-- Системное сообщение -->
        <div v-if="isSystem" class="w-full flex justify-center">
          <div
            class="bg-white p-8 rounded-2xl shadow-xl  border border-gray-200 max-w-md text-center animate-fadeIn"
          >
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Jotter-Finance</h1>
            <h2 class="text-lg text-gray-600 mb-4">powered by Paida AI 🤖</h2>
            <p class="text-gray-500">
              Привет! Я ваш помощник. Начните с ввода сообщения ниже, чтобы обсудить финансы.
            </p>
          </div>
        </div>
      </div>

      <!-- Индикатор печати AI -->
      <div v-if="loading" class="flex justify-start mt-2">
        <div
          class="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none shadow-md  flex items-center space-x-2"
        >
          <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
          <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
          <span class="ml-2 text-gray-500 text-xs italic">Paida печатает...</span>
        </div>
      </div>
    </div>

    <!-- Input box -->
    <div
      class="p-4 bg-gray-50 border-t rounded-lg border-gray-200 flex space-x-2"
    >
      <q-input
        dense
        rounded
        outlined
        v-model="input"
        placeholder="Введите сообщение..."
        class="flex-1"
        @keyup.enter="sendMessage"
      />
      <q-btn
        round
        color="black"
        icon="send"
        @click="sendMessage"
        :disable="loading || input.trim() === ''"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { marked } from 'marked'
import { useApiStore } from 'src/stores/user-api'
import { useQuasar } from 'quasar'
import { userServerURL } from 'src/boot/config'

const input = ref('')
const loading = ref(false)

const chatWindow = ref(null)

const messages = ref([{ role: 'system', content: 'Hello!' }])
const userStore = useApiStore()
const $q = useQuasar()
const name = ref('')
const getUserInformation = async () => {
  await userStore.getUserInfo(userServerURL ,$q)
  const data = userStore.userData
  name.value = `${data.lastName} ${data.firstName}`
  console.log(name.value);

}

const scrollToBottom = () => {
  nextTick(() => {
    const el = chatWindow.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

const isSystem = ref(true)

async function sendMessage() {
  isSystem.value = false
  if (!input.value.trim()) return

  const content = input.value.trim()

  // Добавляем сообщение пользователя в UI
  messages.value.push({
    role: 'user',
    content,
  })

  input.value = ''
  scrollToBottom()
  loading.value = true

  try {
    const response = await axios.post('http://localhost:2500/llm/chat', {
      messages: messages.value.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      model: 'alemllm',
      temperature: 0.7,
      top_p: 1,
    })

    const answer =
      response.data?.message?.trim() ||
      response.data?.raw?.choices?.[0]?.message?.content?.trim() ||
      '⚠️ Пустой ответ от LLM'

    if (answer) {
      messages.value.push({ role: 'assistant', content: answer })
    }
  } catch (err) {
    console.error(err)
    messages.value.push({
      role: 'assistant',
      content: '❌ Ошибка запроса к серверу.',
    })
  }

  loading.value = false
  scrollToBottom()
}

const parseMarkdown = (text) => {
  if (!text) return ''
  return marked(text)
}

onMounted(() => {
  getUserInformation()
})
</script>

<style scoped>
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}
</style>
