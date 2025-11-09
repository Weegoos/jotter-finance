<template>
  <div class="transaction-overview q-mt-md">
    <Table
      :data="Object(transactionsWithAccountName)"
      :title="'Transaction Overview'"
      :columns="transactionColumn"
      :actions="['update', 'delete']"
      @update="openDialog"
      @delete="onDelete"
      @row-click="viewDetailedUser"
    />
    <Dialog :modelValue="isDialog">
      <template #content>
        <Close :sectionName="'Изменить транзакцию'" @emit-click="isDialog = false" />
        <Input label="Сумму" :type="'number'" v-model="amount" class="q-mb-sm"></Input>
        <Select
          label="Тип "
          v-model="type"
          :options="['income', 'expense']"
          class="q-mb-sm"
        ></Select>
        <Input label="Описание" v-model="description" autogrow class="q-mb-sm"></Input>
        <Select
          label="Повторение"
          class="q-mb-sm"
          v-model="repeat"
          :options="['weekly', 'monthly']"
        ></Select>
      </template>

      <template #actions>
        <Button class="text-black" label="Изменить" @emit-click="editTransaction"></Button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { Button, Input, Select } from 'src/components/atoms'
import { Close, Dialog, Table } from 'src/components/molecules'
import { computed, ref } from 'vue'
const props = defineProps({
  data: Object,
})

const isDialog = ref(false)

const transactionsWithAccountName = computed(() => {
  if (!props.data || !Array.isArray(props.data.data)) {
    return {
      data: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
    }
  }

  return {
    ...props.data,
    data: props.data.data.map((t) => ({
      ...t,
      accountName: t.account?.name || '',
      categoryName: t.categories?.name || '',
    })),
  }
})

const transactionColumn = [
  { name: 'amount', label: 'Amount', field: 'amount', sortable: true, align: 'left' },
  { name: 'account', label: 'Account', field: 'accountName', sortable: true, align: 'left' },
  { name: 'Category', label: 'Category', field: 'categoryName', sortable: true, align: 'left' },
  { name: 'type', label: 'Type', field: 'type', sortable: true, align: 'left' },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center',
    field: 'id',
  },
]

const viewDetailedUser = () => {}

const emit = defineEmits(['deleteTransaction', 'updateTransaction'])
const onDelete = (row) => {
  emit('deleteTransaction', row)
}

const amount = ref('')
const type = ref('')
const description = ref('')
const repeat = ref('')
const transactionID = ref('')
const openDialog = async (row) => {
  isDialog.value = true
  amount.value = row.amount
  type.value = row.type
  description.value = row.description
  repeat.value = row.repeat_rule
  transactionID.value = row.id
}

const editTransaction = async () => {
  const payload = {
    amount: Number(amount.value),
    type: type.value,
    description: description.value,
    repeat_rule: repeat.value,
  }
  emit('updateTransaction', payload, transactionID.value)
}
</script>

<style></style>
