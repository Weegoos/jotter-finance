<template>
  <section class="flex min-h-screen bg-gray-100">
    <!-- Drawer -->
    <AIChatDrawer
      @openChat="openChat"
      @createChat="createChat"
      @openModalWindow="openModalWindow"
      @openProject="openProject"
      @openChatByProjectId="openChatByProjectId"
      :topics="topics"
      :projects="projects"
    ></AIChatDrawer>
    <!-- Main chat -->
    <AIChat
      @sendMessage="sendMessage"
      @deleteChat="deleteChat"
      @editChat="editChat"
      @startProject="startProject"
      @deleteProject="deleteProject"
      @editProject="editProject"
      :isSystem="isSystem"
      :isVisibleChatID="isVisibleChatID"
      :messages="messages"
      :loading="loading"
      :thinkingSteps="thinkingSteps"
      :name="name"
      :currentStepIndex="currentStepIndex"
      :isVisibleProjectId="isVisibleProjectId"
      :conversationsByProjectID="conversationsByProjectID"
      :projectData="projectData"
      :projects="projects"
    ></AIChat>
    <Dialog :modelValue="isCreateProject">
      <template #content>
        <Close :section-name="'Создать проект'" @emit-click="isCreateProject = false"></Close>
        <Input
          class="q-my-sm"
          v-model="projectName"
          option-label="name"
          option-value="value"
          label="Название проекта"
        >
        </Input>
      </template>
      <template #actions>
        <Button
          label="Создать проект"
          :disable="!projectName"
          class="text-black rounded-full w-[150px]"
          @click="createProject"
        ></Button>
      </template>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import axios from 'axios'
import { useApiStore } from 'src/stores/user-api'
import { useQuasar } from 'quasar'
import { financeServerURL, userServerURL } from 'src/boot/config'
import { conversationApiStore } from 'src/stores/conversation-api'
import { useRoute, useRouter } from 'vue-router'
import { useMessageApiStore } from 'src/stores/message-api'
import { postMethod } from 'src/composables/api-method/post'
import { putMethod } from 'src/composables/api-method/put'
import { deleteMethod } from 'src/composables/api-method/delete'
import { AIChat, AIChatDrawer } from 'src/components/organisms'
import { useProjectApiStore } from 'src/stores/project-api'
import { Close, Dialog } from 'src/components/molecules'
import { Button, Input } from 'src/components/atoms'
// global variables
const userStore = useApiStore()
const conversationStore = conversationApiStore()
const messageStore = useMessageApiStore()
const projectStore = useProjectApiStore()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const isSystem = ref(true)
const name = ref('')
const thinkingSteps = ref([])
const currentStepIndex = ref(0)

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

const isVisibleProjectId = ref(false)
const checkRoute = () => {
  const chatId = route.params.chatId
  const projectId = route.params.projectId
  const chatIdByProjectId = route.params.chatIdByProjectId

  if (chatId) {
    isSystem.value = false
    isVisibleChatID.value = true
    isVisibleProjectId.value = false
    messages.value = []
  } else if (projectId && !chatIdByProjectId) {
    isSystem.value = false
    isVisibleChatID.value = false
    isVisibleProjectId.value = true
    messages.value = [] // project-specific данные
  } else if (projectId && chatIdByProjectId) {
    isSystem.value = false
    isVisibleChatID.value = true
    isVisibleProjectId.value = false
    messages.value = []
  } else {
    // системный экран
    isSystem.value = true
    isVisibleChatID.value = false
    isVisibleProjectId.value = false
    messages.value = []
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

// project
const isCreateProject = ref(false)
const projects = ref([])
const getAllProjects = async () => {
  try {
    const data = await projectStore.getAllProjects($q)
    projects.value = data
    console.log('Все проекты получены', data)
  } catch {
    //
  }
}

const projectData = ref([])
const getProjectById = async (id) => {
  const data = await projectStore.getAllProjectById($q, id)
  projectData.value = data
}

const projectName = ref(null)
const openModalWindow = () => {
  isCreateProject.value = true
}

const openProject = async (id) => {
  await router.push(`/project/${id}/chat`)
}

const createProject = async () => {
  const payload = {
    title: projectName.value,
    type: 'finance',
  }
  await postMethod(financeServerURL, 'project', payload, $q, 'Проект создан')
  getAllProjects()
  isCreateProject.value = false
  projectName.value = ''
}

const startProject = async () => {
  const projectId = route.params.projectId
  if (projectId) {
    const payload = {
      title: 'New chat',
      project_id: projectId,
    }
    const res = await postMethod(financeServerURL, 'conversation', payload, $q, 'Чат создан')
    getAllProjects()
    console.log(res)
    router.push(`/project/${projectId}/chat/${res.id}`)
  }
}

const deleteProject = async () => {
  const projectId = route.params.projectId
  try {
    await deleteMethod(financeServerURL, 'project', projectId)
    getAllProjects()
    router.push('/chat')
  } catch {
    //
  }
}

const editProject = async (topic, value) => {
  const projectId = route.params.projectId
  const payload = {
    title: value,
    type: 'finance',
  }
  await putMethod(financeServerURL, `project/${projectId}`, payload, $q, {})
  getAllProjects()
}
// the end of project

// conversation
const conversationsByProjectID = ref([])
const getAllConversationsByProjectID = async () => {
  const projectId = route.params.projectId
  if (projectId) {
    const data = await conversationStore.getAllConversationsByProjectID($q, projectId)
    conversationsByProjectID.value = data
    console.log(data)
  }
}

// the end of conversation

const messages = ref([])
watch(
  () => [route.params.chatId, route.params.projectId, route.params.chatIdByProjectId],
  async ([chatId, projectId, chatIdByProjectId]) => {
    if (chatId) {
      checkRoute()
      // Загрузка сообщений чата
      try {
        const data = await messageStore.getAllMessages($q, chatId)
        if (!data || data.length === 0) {
          isSystem.value = true
          messages.value = []
        } else {
          isSystem.value = false
          messages.value = data
          isVisibleChatID.value = true
          scrollToBottom()
        }
        console.log('Chat messages loaded:', data.length)
      } catch (err) {
        console.error('Error loading chat messages:', err)
        isSystem.value = true
        messages.value = []
      }
    } else if (projectId && !chatIdByProjectId) {
      checkRoute()
      getAllConversationsByProjectID()
      isSystem.value = false
      messages.value = [] // или project-specific данные
      console.log('Project route:', projectId)
      getProjectById(projectId)
    } else if (chatIdByProjectId && projectId) {
      checkRoute()
      try {
        const data = await messageStore.getAllMessages($q, chatIdByProjectId)
        if (!data || data.length === 0) {
          isSystem.value = true
          messages.value = []
        } else {
          isSystem.value = false
          messages.value = data
          isVisibleChatID.value = true
          scrollToBottom()
        }
        console.log('Chat messages loaded:', data.length)
      } catch (err) {
        console.error('Error loading chat messages:', err)
        isSystem.value = true
        messages.value = []
      }
    } else {
      isSystem.value = true
      messages.value = []
    }
  },
  { immediate: true },
)

const scrollToBottom = () => {
  const chatId = route.params.chatId
  const chatIdByProjectId = route.params.chatIdByProjectId
  if (isSystem.value) return
  if (!chatId && !chatIdByProjectId) return

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

const openChatByProjectId = async (id, projectId) => {
  await router.push(`/project/${projectId}/chat/${id}`)
  await nextTick()
  scrollToBottom()
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

const identifyIdAndSendMessage = async (id, content, answer) => {
  await postMethod(
    financeServerURL,
    'message',
    {
      conversationId: id,
      role: 'user',
      content,
    },
    $q,
  )

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

  await putMethod(financeServerURL, `conversation/${id}`, { title: res.data.generated_topic }, $q)

  getAllConversations()
  getAllProjects()
  getAllConversationsByProjectID()
  answer = res.data?.message?.trim() || '⚠️ Пустой ответ от LLM'

  messages.value.push({ role: 'assistant', content: answer })

  await postMethod(
    financeServerURL,
    'message',
    {
      conversationId: id,
      role: 'assistant',
      content: answer,
    },
    $q,
  )
}

async function sendMessage(inputContent) {
  const content = inputContent?.trim()
  if (!content) return
  const chatId = route.params.chatId
  const chatIdByProjectId = route.params.chatIdByProjectId

  // пушим сообщение пользователя
  messages.value.push({ role: 'user', content })
  isSystem.value = false
  scrollToBottom()

  loading.value = true
  thinkingSteps.value = []
  currentStepIndex.value = 0

  try {
    let answer = ''
    if (chatIdByProjectId) {
      await identifyIdAndSendMessage(chatIdByProjectId, content, answer)
    } else if (chatId) {
      await identifyIdAndSendMessage(chatId, content, answer)
    }
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

const editChat = async (projectInfo) => {
  const chatId = route.params.chatId
  const payload = {
    project_id: projectInfo.id,
  }

  await putMethod(financeServerURL, `conversation/${chatId}`, payload, $q, {})
  getAllConversations()
  getAllConversationsByProjectID()
  getAllProjects()
}

const deleteChat = async () => {
  const chatId = route.params.chatId
  const chatIdByProjectId = route.params.chatIdByProjectId
  try {
    if (chatId) {
      await deleteMethod(financeServerURL, 'conversation', chatId)
    } else if (chatIdByProjectId) {
      await deleteMethod(financeServerURL, 'conversation', chatIdByProjectId)
    }
    getAllConversations()
    getAllConversationsByProjectID()
    getAllProjects()
    router.push('/chat')
  } catch {
    //
  }
}

watch(
  () => [route.params.chatId, route.params.projectId],
  () => {
    checkRoute()
    resetThinkingState()
  },
  { immediate: true },
)

onMounted(() => {
  getUserInformation()
  getAllConversations()
  checkRoute()
  getAllProjects()
  getAllConversationsByProjectID()
})
</script>
