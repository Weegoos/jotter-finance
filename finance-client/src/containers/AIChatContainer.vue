<template>
  <section class="flex min-h-screen bg-gray-100">
    <!-- Drawer -->
    <q-drawer
      side="left"
      v-model="drawerLeft"
      :width="250"
      :breakpoint="500"
      class="bg-white shadow-md flex flex-col"
    >
      <div class="p-2 flex-none">
        <Button flat dense icon="mdi-folder-plus" label="Новый чат" class="w-full justify-start" />
      </div>

      <q-list class="flex-1">
        <q-item
          clickable
          v-ripple
          v-for="topic in topics"
          :key="topic.id"
          @click="openChat(topic.id)"
        >
          <q-item-section avatar>
            <q-icon name="mdi-database" />
          </q-item-section>
          <q-item-section>{{ topic.title }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main chat -->
    <main class="flex-1 flex justify-center px-6 py-4">
      <div class="w-full max-w-5xl bg-white rounded-xl shadow-md flex flex-col">
        <!-- System screen -->
        <div v-if="isSystem" class="p-10 flex justify-center">
          <div class="max-w-md text-center">
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

        <!-- Messages -->
        <div class="flex-1 p-4 space-y-4">
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
              class="max-w-[70%]"
              bg-color="grey-3"
              text-color="black"
            >
              <div v-html="parseMarkdown(msg.content)" />
            </q-chat-message>
          </div>

          <!-- Thinking Steps -->
          <div v-if="loading && thinkingSteps.length" class="flex flex-col gap-2 mt-2">
            <div
              v-for="(step, i) in thinkingSteps"
              :key="i"
              v-show="i <= currentStepIndex"
              class="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm animate-fadeIn"
            >
              {{ step }}
            </div>
          </div>

          <!-- Fallback: печатает -->
          <div v-else-if="loading" class="flex justify-start mt-2">
            <div class="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl animate-pulse">
              Формирую ответ...
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="sticky bottom-0 bg-gray-50 border-t p-4 z-10">
          <div class="flex gap-2">
            <q-input
              dense
              outlined
              rounded
              v-model="input"
              placeholder="Введите сообщение…"
              class="flex-1"
              @keyup.enter="sendMessage"
            />
            <q-btn
              round
              color="black"
              icon="send"
              @click="sendMessage"
              :disable="loading || !input.trim()"
            />
          </div>

          <!-- Suggestions -->
          <div v-if="!input.trim() && suggestions.length" class="mt-2 border rounded bg-white">
            <div
              v-for="(s, i) in suggestions"
              :key="i"
              class="p-2 hover:bg-gray-100 cursor-pointer flex gap-2"
              @click="selectSuggestion(s)"
            >
              <q-icon name="search" size="16px" />
              {{ s }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import axios from 'axios'
import { marked } from 'marked'
import { useApiStore } from 'src/stores/user-api'
import { Cookies, useQuasar } from 'quasar'
import { financeServerURL, userServerURL } from 'src/boot/config'
import { Button } from 'src/components/atoms'
import { conversationApiStore } from 'src/stores/conversation-api'
import { useRoute, useRouter } from 'vue-router'
import { useMessageApiStore } from 'src/stores/message-api'
import { postMethod } from 'src/composables/api-method/post'

// global variables
const userStore = useApiStore()
const conversationStore = conversationApiStore()
const messageStore = useMessageApiStore()
const $q = useQuasar()
const route = useRoute()
const loading = ref(false)
const chatWindow = ref(null)
const isSystem = ref(true)
const name = ref('')
const thinkingSteps = ref([])
const currentStepIndex = ref(0)
const drawerLeft = ref(true)
const router = useRouter()

function playThinkingSteps(steps) {
  thinkingSteps.value = steps
  currentStepIndex.value = 0

  const interval = setInterval(() => {
    currentStepIndex.value++
    if (currentStepIndex.value >= steps.length) {
      clearInterval(interval)
    }
  }, 1200)
}

const checkChatID = () => {
  const chatId = route.params.id
  if (!chatId || chatId.trim().length === 0) {
    isSystem.value = true
    messages.value = []
    console.log('There is no chatId')
  } else {
    isSystem.value = false
  }
}

const topics = ref([])
const getAllConversations = async () => {
  try {
    const data = await conversationStore.getAllConversation($q)
    topics.value = data
  } catch {
    //
  }
}

const messages = ref([])
const getAllMessagesByChatID = async () => {
  const chatId = route.params.id
  if (!chatId) {
    checkChatID()
    isSystem.value = true
  } else {
    isSystem.value = false
  }

  try {
    const data = await messageStore.getAllMessages($q, chatId)
    messages.value = data
    scrollToBottom()
  } catch (err) {
    console.error('Error loading messages:', err)
  }
}

const scrollToBottom = () => {
  const chatId = route.params.id
  if (!chatId || isSystem.value) return

  nextTick(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })
  })
}

const openChat = async (id) => {
  await router.push(`/chat/${id}`)
  await nextTick()
  scrollToBottom()
}

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    const el = chatWindow.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  },
)

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
}

async function sendMessage() {
  if (!input.value.trim()) return

  isSystem.value = false
  const content = input.value.trim()
  const chatId = route.params.id

  // user message
  messages.value.push({ role: 'user', content })
  await postMethod(
    financeServerURL,
    'message',
    {
      conversationId: chatId,
      role: 'user',
      content,
    },
    $q,
  )

  input.value = ''
  scrollToBottom()

  loading.value = true
  thinkingSteps.value = []
  currentStepIndex.value = 0

  const type = detectQueryType(content)
  let answer = ''

  try {
    if (type === 'finance') {
      const res = await axios.post(
        `${financeServerURL}ai/advice`,
        { question: content },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
        },
      )

      answer = res.data?.data?.trim() || '⚠️ Нет ответа от ассистента.'
    } else {
      const res = await axios.post('http://localhost:2500/llm/smart-chat', {
        message: content,
        conversation_history: messages.value
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role,
            content: String(m.content),
          })),
        model: 'alemllm',
        temperature: 0.7,
      })

      if (res.data?.thinking_steps?.length) {
        playThinkingSteps(res.data.thinking_steps)

        await new Promise((resolve) => setTimeout(resolve, res.data.thinking_steps.length * 1200))
      }

      answer = res.data?.message?.trim() || '⚠️ Пустой ответ от LLM'
    }

    // 👉 сначала показываем ответ
    messages.value.push({ role: 'assistant', content: answer })

    await postMethod(
      financeServerURL,
      'message',
      {
        conversationId: chatId,
        role: 'assistant',
        content: answer,
      },
      $q,
    )
  } catch (err) {
    console.error(err)
    messages.value.push({
      role: 'assistant',
      content: 'Ошибка запроса к серверу.',
    })
  } finally {
    // 👉 только В САМОМ КОНЦЕ
    loading.value = false
    thinkingSteps.value = []
    scrollToBottom()
  }
}

function resetThinkingState() {
  loading.value = false
  thinkingSteps.value = []
  currentStepIndex.value = 0
}

watch(
  () => route.params.id,
  async () => {
    resetThinkingState()
    checkChatID()
    await getAllMessagesByChatID()
    scrollToBottom()
  },
  { immediate: true },
)

onMounted(() => {
  getUserInformation()
  getAllConversations()
  checkChatID()
  getAllMessagesByChatID()
  console.log(isSystem.value)
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}
</style>
