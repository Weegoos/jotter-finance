<template>
  <div class="total_balance q-mt-md">
    <q-card class="my-card grid grid-cols-2 items-center">
      <q-card-section>
        <div class="text-h6">Total Balance</div>
        <div class="text-subtitle2" >
          {{props.balance}}
        </div>
      </q-card-section>
      <q-card-section class="row gap-4 justify-end">
        <Button
          class="text-white bg-black"
          :label="'Add Transaction'"
          rounded
          icon="mdi-plus"
          @emit-click="addPayment = true"
        />
        <Button class="text-black bg-white" :label="'Send Invoice'" rounded icon="mdi-arrow-up" />
        <Dropdown
          dropdown-icon="mdi-dots-horizontal"
          :data="dashboardBalanceButtons"
          @onItemClick="handleClick"
        />
      </q-card-section>
      <Dialog :modelValue="addPayment" :style="'width: 300px'">
        <template #content>
          <Close :sectionName="'Расход'" @emit-click="addPayment = false" />
          <Select
            label="Выберите счет"
            :options="propsAccounts"
            v-model="account"
            class="q-mb-sm"
          ></Select>
          <Select
            label="Категория операции"
            :options="propsCategories"
            v-model="category"
            class="q-mb-sm"
          ></Select>
          <Input label="Сумма операции" :type="'Number'" v-model="amount" class="q-mb-sm"></Input>
          <Select label="Тип операции" v-model="type" class="q-mb-sm"></Select>
          <Input label="Описание" v-model="description" autogrow class="q-mb-sm"></Input>
          <Select
            label="Повторять (опционально)"
            :options="['weekly', 'monthly']"
            v-model="repeat"
            class="q-mb-sm"
          ></Select>
        </template>
        <template #actions>
          <Button @emit-click="submitForm" class="text-black" :label="'Создать'"></Button>
        </template>
      </Dialog>
      <Dialog :model-value="isCategory">
        <template #content>
          <Close :sectionName="'Категория'" @emit-click="isCategory = false" />
          <Input label="Название" class="q-mb-sm" v-model="categoryName"></Input>
          <Select
            :options="['income', 'expense']"
            label="Тип"
            v-model="categoryType"
            class="q-mb-sm"
          ></Select>
          <Button class="text-black" label="Создать" @emit-click="createCategory"></Button>
          <DottedSeparator />

          <q-list bordered v-for="(item, index) in props.categories" :key="index">
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon
                  :name="item.type === 'expense' ? 'mdi-trending-down' : 'mdi-trending-up'"
                  :class="item.type === 'expense' ? 'text-red' : 'text-green'"
                />
              </q-item-section>
              <q-item-section>{{ item.name }}</q-item-section>
              <q-item-section avatar>
                <Dropdown
                  dropdown-icon="mdi-dots-horizontal"
                  :data="dashboardCategoryButtons"
                  @onItemClick="(action) => handleClickCategory(action, item)"
                  flat
                  dense
                />
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </Dialog>
    </q-card>
  </div>
</template>

<script setup>
import { Button, DottedSeparator, Input, Select } from 'src/components/atoms'
import { Close, Dialog, Dropdown } from 'src/components/molecules'
import { computed, ref, watch } from 'vue'
const props = defineProps({
  activeAccounts: Array,
  categories: Array,
  balance: Number,
})

const isCategory = ref(false)
const dashboardBalanceButtons = computed(() => [
  {
    label: 'Create Category',
    icon: 'mdi-plus',
    action: () => {
      isCategory.value = true
    },
  },
])

const dashboardCategoryButtons = computed(() => [
  {
    icon: 'mdi-delete',
    label: 'Удалить',
    action: (item) => {
      emit('deleteCategory', item)
    },
  },
])

function handleClick(item) {
  if (item.action) item.action()
}

const handleClickCategory = (action, category) => {
  action.action(category)
}

const emit = defineEmits(['submit', 'createCategory', 'deleteCategory'])

const propsAccounts = computed(() =>
  props.activeAccounts.map((account) => ({
    label: account.name,
    value: account.id,
  })),
)

const propsCategories = computed(() =>
  props.categories.map((category) => ({
    label: category.name,
    value: category.id,
    type: category.type,
  })),
)

const today = new Date().toISOString().split('T')[0]

const addPayment = ref(false)
const account = ref('')
const category = ref('')
const amount = ref('')
const type = ref(category.value.type)

watch(
  () => category.value.type,
  (newVal) => {
    type.value = newVal
  },
)
const description = ref('')
const repeat = ref('')
const submitForm = () => {
  const payload = {
    accountId: account.value.value,
    categoryId: category.value.value,
    amount: Number(amount.value),
    type: type.value,
    description: description.value,
    repeat_rule: repeat.value,
    date: today,
  }
  emit('submit', payload)
}

const categoryName = ref('')
const categoryType = ref('')
const createCategory = () => {
  const payload = {
    name: categoryName.value,
    type: categoryType.value,
  }

  emit('createCategory', payload)
}
</script>

<style></style>
