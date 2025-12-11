<template>
  <div
    :class="{
      'fixed fixed-center w-[50%]': isSystem,
      'w-[80%] flex flex-col justify-self-center  ': !isSystem,
    }"
    class="rounded-xl shadow-md overflow-hidden"
  >
    <!-- Сообщения с прокруткой -->
    <div
      ref="chatWindow"
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
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
            class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md text-center animate-fadeIn"
          >
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Jotter Finance</h1>
            <h2 class="text-lg text-gray-600 mb-4">powered by pAIda 🤖</h2>
            <p class="text-gray-600 mb-4">
              Привет! 👋 Я pAIda — твой персональный финансовый ассистент.
            </p>
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
          <span class="ml-2 text-gray-500 text-xs italic">Печатает...</span>
        </div>
      </div>
    </div>

    <!-- Input box -->
    <div class="p-4 bg-gray-50 border-t rounded-lg border-gray-200 flex flex-col space-y-2">
      <!-- Инпут -->
      <div class="flex space-x-2 relative">
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

    <!-- Подсказки снизу -->
    <div
      v-if="input.trim() === '' && suggestions.length"
      class="mt-2 bg-white border border-gray-200 rounded shadow-md"
    >
      <div
        v-for="(s, i) in suggestions"
        :key="i"
        class="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
        @click="selectSuggestion(s)"
      >
        <q-icon name="search" size="16px" />
        <span class="text-gray-700">{{ s }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { marked } from 'marked'
import { useApiStore } from 'src/stores/user-api'
import { Cookies, useQuasar } from 'quasar'
import { financeServerURL, userServerURL } from 'src/boot/config'

const loading = ref(false)
const chatWindow = ref(null)
const messages = ref([{ role: 'system', content: 'Hello!' }])
const isSystem = ref(true)
const name = ref('')
const userStore = useApiStore()
const $q = useQuasar()

// Прокрутка чата вниз
const scrollToBottom = () => {
  nextTick(() => {
    const el = chatWindow.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

const financeKeywords = ['доход', 'расход', 'бюджет', 'финансы', 'транзакция']

function detectQueryType(question) {
  const lower = question.toLowerCase()
  return financeKeywords.some((k) => lower.includes(k)) ? 'finance' : 'general'
}
const getUserInformation = async () => {
  await userStore.getUserInfo(userServerURL, $q)
  const data = userStore.userData
  name.value = `${data.lastName} ${data.firstName}`
}

const parseMarkdown = (text) => (text ? marked(text) : '')

const input = ref('')
const suggestions = ref([
  'Сделай отчет по финансам (доход, расход, транзакция)',
  'Сколько я потратил на еду за месяц?',
  'Помоги составить бюджет на следующий месяц',
  'Какие инвестиции лучше сейчас?',
  'Сделай прогноз по расходам на месяц',
])

function selectSuggestion(s) {
  input.value = s
  // sendMessage()
}
async function sendMessage() {
  if (!input.value.trim()) return
  isSystem.value = false

  const content = input.value.trim()
  messages.value.push({ role: 'user', content })
  input.value = ''
  scrollToBottom()
  loading.value = true

  const type = detectQueryType(content)

  try {
    let answer = ''

    if (type === 'finance') {
      const res = await axios.post(
        `${financeServerURL}ai/advice`,
        { question: content },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
        },
      )
      answer = res.data?.data?.trim() || '⚠️ Нет ответа от финансового ассистента.'
    } else {
      const body = {
        model: 'alemllm',
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          ...messages.value
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: String(m.content) })),
        ],
      }

      const res = await axios.post('http://localhost:2500/llm/chat', body)
      answer =
        res.data?.message?.trim() ||
        res.data?.raw?.choices?.[0]?.message?.content?.trim() ||
        '⚠️ Пустой ответ от LLM'
    }

    messages.value.push({ role: 'assistant', content: answer })
  } catch (err) {
    console.error(err)
    messages.value.push({
      role: 'assistant',
      content: '❌ Ошибка запроса к серверу.',
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
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
