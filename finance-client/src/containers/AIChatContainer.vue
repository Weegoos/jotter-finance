<template>
  <div
    :class="{
      'fixed fixed-center w-[50%]': isSystem,
      'w-[80%] flex flex-col justify-self-center h-full ': !isSystem,
    }"
    class="rounded-xl shadow-md overflow-hidden"
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
          :name="msg.role === 'user' ? name : 'pAIda'"
          :sent="msg.role === 'user'"
          :avatar-color="msg.role === 'user' ? 'primary' : 'blue-grey-5'"
          class="mb-2 max-w-[70%]"
        >
          <div v-html="parseMarkdown(msg.content)" class="prose dark:prose-invert"></div>
        </q-chat-message>

        <!-- Системное сообщение -->
        <div v-if="isSystem" class="w-full flex justify-center">
          <div
            class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-lg text-center animate-fadeIn"
          >
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Jotter Finance</h1>
            <h2 class="text-lg text-gray-600 mb-4">powered by pAIda 🤖</h2>
            <p class="text-gray-600 mb-4">Привет! 👋 Я pAIda — твой персональный финансовый ассистент.</p>
            <div class="text-left text-gray-500 text-sm space-y-1">
              <p>Я могу помочь тебе с:</p>
              <ul class="list-none pl-2 space-y-1">
                <li>📊 Анализом расходов и доходов</li>
                <li>💰 Планированием бюджета</li>
                <li>🎯 Постановкой финансовых целей</li>
                <li>📈 Основами инвестирования</li>
                <li>💡 Советами по экономии</li>
              </ul>
            </div>
            <p class="text-gray-600 mt-4 font-medium">Чем могу помочь сегодня?</p>
          </div>
        </div>
      </div>

      <!-- Индикатор печати AI -->
      <div v-if="loading" class="flex justify-start mt-2">
        <div
          class="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none shadow-md flex items-center space-x-2"
        >
          <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
          <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
          <span class="ml-2 text-gray-500 text-xs italic">pAIda думает...</span>
        </div>
      </div>
    </div>

    <!-- Input box -->
    <div class="p-4 bg-gray-50 border-t rounded-lg border-gray-200 flex space-x-2">
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
import { marked } from 'marked'
import { useApiStore } from 'src/stores/user-api'
import { useQuasar } from 'quasar'
import { userServerURL } from 'src/boot/config'

const input = ref('')
const loading = ref(false)
const isStreaming = ref(false)

const chatWindow = ref(null)

const messages = ref([{ role: 'system', content: 'Hello!' }])
const userStore = useApiStore()
const $q = useQuasar()
const name = ref('')

const LLM_API_URL = 'http://localhost:2500'

const getUserInformation = async () => {
  await userStore.getUserInfo(userServerURL, $q)
  const data = userStore.userData
  name.value = `${data.lastName} ${data.firstName}`
  console.log(name.value)
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
  isStreaming.value = true

  // Добавляем пустое сообщение ассистента для streaming
  const assistantMessage = { role: 'assistant', content: '' }
  messages.value.push(assistantMessage)

  try {
    const response = await fetch(`${LLM_API_URL}/llm/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: 'alemllm',
        temperature: 0.7,
        top_p: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    loading.value = false // Убираем индикатор "печатает" когда начинается streaming

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n')

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
          try {
            const jsonStr = trimmedLine.slice(6)
            const json = JSON.parse(jsonStr)

            // Обработка ошибки от сервера
            if (json.error) {
              assistantMessage.content = `❌ Ошибка: ${json.error}`
              break
            }

            // Извлекаем delta content из OpenAI-style ответа
            const delta = json.choices?.[0]?.delta?.content || ''
            if (delta) {
              assistantMessage.content += delta
              scrollToBottom()
            }
          } catch (e) {
            // Пропускаем невалидный JSON (может быть частичная строка)
          }
        }
      }
    }

    // Если ответ пустой после streaming
    if (!assistantMessage.content.trim()) {
      assistantMessage.content = '⚠️ Пустой ответ от LLM'
    }
  } catch (err) {
    console.error('Streaming error:', err)
    // Обновляем последнее сообщение ассистента
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg.role === 'assistant' && !lastMsg.content) {
      lastMsg.content = '❌ Ошибка подключения к серверу.'
    }
  }

  loading.value = false
  isStreaming.value = false
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
