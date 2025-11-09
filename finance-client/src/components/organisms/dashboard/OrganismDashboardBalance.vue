<template>
  <div class="total_balance q-mt-md">
    <q-card class="my-card grid grid-cols-2 items-center">
      <q-card-section>
        <div class="text-h6">Total Balance</div>
        <div class="text-subtitle2">$ 3200</div>
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
        <Dropdown dropdown-icon="mdi-dots-horizontal" :data="dashboardBalanceButtons" />
      </q-card-section>
      <Dialog :modelValue="addPayment" :style="'width: 300px'">
        <template #content>
          <Close :sectionName="'Расход'" @emit-click="addPayment = false"/>
          <Select
            label="Выберите счет"
            :options="propsAccounts"
            v-model="account"
            class="q-mb-sm"
          ></Select>
          <Select label="Категория операции" :options="propsCategories" v-model="category" class="q-mb-sm"></Select>
          <Input label="Сумма операции" :type="'Number'" v-model="amount" class="q-mb-sm"></Input>
          <Select label="Тип операции" :options="['income', 'expense']" v-model="type" class="q-mb-sm"></Select>
          <Input label="Описание" v-model="description" autogrow class="q-mb-sm"></Input>
          <Select label="Повторять (опционально)" :options="['weekly', 'monthly']" v-model="repeat" class="q-mb-sm"></Select>
        </template>
        <template #actions>
          <Button @emit-click="submitForm" class="text-black" :label="'Создать'"></Button>
        </template>
      </Dialog>
    </q-card>
  </div>
</template>

<script setup>
import { Button, Input, Select } from 'src/components/atoms'
import { Close, Dialog, Dropdown } from 'src/components/molecules'
import { computed, ref } from 'vue'

const props = defineProps({
  activeAccounts: Array,
  categories: Array,
})

const dashboardBalanceButtons = computed(() => [
  {
    label: 'Create Category',
    icon: 'mdi-plus',
  },
])

const emit = defineEmits(['submit'])

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
  })),
)

const today = new Date().toISOString().split('T')[0]
console.log(today)

const addPayment = ref(false)
const account = ref('')
const category = ref('')
const amount = ref('')
const type = ref('')
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
    date: today
  }
  emit('submit', payload)
  // addPayment.value = false
}
</script>

<style></style>
