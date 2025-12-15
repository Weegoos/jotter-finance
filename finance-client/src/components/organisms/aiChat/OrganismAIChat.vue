<template>
  <main class="flex-1 flex justify-center px-6 py-4">
    <div class="w-full max-w-5xl bg-white rounded-xl shadow-md flex flex-col">
      <!-- System screen -->
      <div v-if="props.isSystem" class="p-10 flex justify-center">
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
        <div
          v-if="!props.isVisibleChatID"
          class="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 text-sm space-y-2"
        >
          <p>
            💡 Добро пожаловать! Вот несколько шагов, которые помогут вам эффективно управлять
            финансами:
          </p>
          <ol class="list-decimal list-inside space-y-1">
            <li>
              📊 Анализируйте свои доходы и расходы: записывайте все транзакции и ищите возможности
              для оптимизации.
            </li>
            <li>
              💰 Планируйте бюджет: устанавливайте лимиты на категории расходов и следите за их
              выполнением.
            </li>
            <li>
              🎯 Ставьте финансовые цели: например, накопить резервный фонд, купить недвижимость или
              инвестировать в образование.
            </li>
            <li>
              📈 Инвестируйте с умом: изучайте разные инструменты, диверсифицируйте активы,
              минимизируйте риски.
            </li>
            <li>
              💡 Оптимизируйте повседневные расходы: ищите выгодные тарифы, подписки и скидки, чтобы
              больше сберегать.
            </li>
            <li>
              🌱 Развивайтесь финансово: читайте книги, проходите курсы и следите за новостями
              экономики.
            </li>
            <li>
              📝 Регулярно анализируйте прогресс: проверяйте, насколько вы приближаетесь к целям,
              корректируйте стратегию при необходимости.
            </li>
          </ol>
          <p>
            Следуя этим рекомендациям, вы сможете увеличить доход, контролировать расходы и
            постепенно достигнуть финансовой независимости.
          </p>
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
            :name="msg.role === 'user' ? props.name : 'Paida AI-Ассистент'"
            :sent="msg.role === 'user'"
            class="max-w-[70%]"
            bg-color="grey-3"
            text-color="black"
          >
            <div v-html="parseMarkdown(msg.content)" />
          </q-chat-message>
        </div>

        <!-- Thinking Steps -->
        <div v-if="props.loading && props.thinkingSteps.length" class="flex flex-col gap-2 mt-2">
          <div
            v-for="(step, i) in props.thinkingSteps"
            :key="i"
            v-show="i <= props.currentStepIndex"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm animate-fadeIn"
          >
            {{ step }}
          </div>
        </div>

        <!-- Fallback: печатает -->
        <div v-else-if="props.loading" class="flex justify-start mt-2">
        <div class="bg-gray-200 italic text-gray-600 px-4 py-2 rounded-xl flex items-center gap-1">
  <span>Paida формирует ответ</span>
  <span class="dots">
    <span>.</span><span>.</span><span>.</span>
  </span>
</div>
        </div>
      </div>

      <!-- Input -->
      <div v-if="props.isVisibleChatID" class="sticky bottom-0 bg-gray-50 border-t p-4 z-10">
        <div class="flex gap-2">
          <Input
            dense
            outlined
            rounded
            :model-value="input"
            placeholder="Введите сообщение…"
            class="flex-1"
            @update:model-value="input = $event"
            @keyup.enter="sendMessage"
          />
          <Button round color="red" icon="mdi-delete" @click="deleteChat" />
          <Button
            round
            color="black"
            icon="send"
            @click="sendMessage"
            :disable="props.loading || !input.trim()"
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
</template>

<script setup>
import { marked } from 'marked'
import { Button, Input } from 'src/components/atoms'
import { ref, watch } from 'vue'

const props = defineProps({
  isSystem: Boolean,
  isVisibleChatID: Boolean,
  messages: Object,
  loading: Boolean,
  thinkingSteps: Array,
  name: String,
  currentStepIndex: Number,
})
const input = ref('')
watch(
  () => props.isSystem,
  (newVal) => {
    console.log(newVal)
  },
)

const parseMarkdown = (text) => (text ? marked(text) : '')

const suggestions = ref([
  'Сделай отчет по финансам (доход, расход, транзакция)',
  'Сколько я заработал за месяц?',
  'Какие основные расходы у меня за месяц?',
  'Помоги составить план сбережений',
  'Как оптимизировать расходы на жилье?',
  'Какие варианты инвестиций подходят для новичка?',
])

function selectSuggestion(s) {
  input.value = s
}

const emit = defineEmits(['sendMessage', 'deleteChat'])

const sendMessage = () => {
  emit('sendMessage', input.value)
  input.value = ''
}

const deleteChat = () => {
  emit('deleteChat')
}
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

.dots span {
  animation: blink 1.4s infinite;
  opacity: 0;
}

.dots span:nth-child(1) { animation-delay: 0s; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 20% { opacity: 0; }
  50%, 100% { opacity: 1; }
}
</style>
