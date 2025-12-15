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
        <Button
          flat
          dense
          icon="mdi-folder-plus"
          label="Новый чат"
          class="w-full justify-start"
          @click="createChat"
        />
      </div>

      <div class="flex-1 overflow-y-auto">
        <q-list>
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
      </div>
    </q-drawer>

    <!-- Main chat -->
    <AIChat
      @sendMessage="sendMessage"
      @deleteChat="deleteChat"
      :isSystem="isSystem"
      :isVisibleChatID="isVisibleChatID"
      :messages="messages"
      :loading="loading"
      :thinkingSteps="thinkingSteps"
      :name="name"
      :currentStepIndex="currentStepIndex"
    ></AIChat>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import axios from 'axios'
import { useApiStore } from 'src/stores/user-api'
import { Cookies, useQuasar } from 'quasar'
import { financeServerURL, userServerURL } from 'src/boot/config'
import { Button } from 'src/components/atoms'
import { conversationApiStore } from 'src/stores/conversation-api'
import { useRoute, useRouter } from 'vue-router'
import { useMessageApiStore } from 'src/stores/message-api'
import { postMethod } from 'src/composables/api-method/post'
import { putMethod } from 'src/composables/api-method/put'
import { deleteMethod } from 'src/composables/api-method/delete'
import { AIChat } from 'src/components/organisms'
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

const isVisibleChatID = ref(false)
const checkChatID = () => {
  const chatId = route.params.id
  if (!chatId || chatId.trim().length === 0) {
    isSystem.value = true
    messages.value = []
    isVisibleChatID.value = false
  } else {
    isSystem.value = false
    isVisibleChatID.value = true
  }
}

const topics = ref([])
const getAllConversations = async () => {
  try {
    const data = await conversationStore.getAllConversation($q)
    topics.value = data
    console.log('Все чаты получены')
  } catch {
    //
  }
}

const messages = ref([])
const getAllMessagesByChatID = async () => {
  const chatId = route.params.id
  if (!chatId) {
    // Нет чата — показываем системный экран
    isSystem.value = true
    messages.value = []
    return
  }

  try {
    const data = await messageStore.getAllMessages($q, chatId)
    if (data.length === 0) {
      isSystem.value = true
      messages.value = []
    } else {
      // Есть сообщения — отображаем их
      isSystem.value = false
      messages.value = data
      scrollToBottom()
    }

    console.log('Количество сообщений:', data.length)
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

const createChat = async () => {
  const payload = {
    title: 'New chat',
  }

  const res = await postMethod(financeServerURL, 'conversation', payload, $q, 'Чат Создан')
  console.log(res)

  getAllConversations()
  router.push(`/chat/${res.id}`)
}

async function sendMessage(inputContent) {
  const content = inputContent?.trim()
  if (!content) return
  const chatId = route.params.id

  // пушим сообщение пользователя
  messages.value.push({ role: 'user', content })
  isSystem.value = false
  scrollToBottom()

  loading.value = true
  thinkingSteps.value = []
  currentStepIndex.value = 0

  try {
    // сохраняем сообщение пользователя
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

    // Генерация ответа
    let answer = ''
    const type = detectQueryType(content)

    if (type === 'finance') {
      const res = await axios.post(
        `${financeServerURL}ai/advice`,
        { question: content },
        {
          headers: { Authorization: `Bearer ${Cookies.get('access_token')}` },
        },
      )
      answer = res.data?.data?.trim() || '⚠️ Нет ответа от ассистента.'
    } else {
      const res = await axios.post('http://localhost:2500/llm/smart-chat', {
        message: content,
        conversation_history: [],
        conversation_id: '',
        model: 'alemllm',
        temperature: 0.7,
      })

      if (res.data?.thinking_steps?.length) {
        playThinkingSteps(res.data.thinking_steps)
        await new Promise((r) => setTimeout(r, res.data.thinking_steps.length * 1200))
      }

      await putMethod(
        financeServerURL,
        `conversation/${chatId}`,
        { title: res.data.generated_topic },
        $q,
      )

      getAllConversations()
      answer = res.data?.message?.trim() || '⚠️ Пустой ответ от LLM'
    }

    // пушим ответ ассистента
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

const deleteChat = async () => {
  const chatId = route.params.id
  try {
    await deleteMethod(financeServerURL, 'conversation', chatId)
    getAllConversations()
    router.push('/chat')
  } catch {
    //
  }
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
})
</script>
