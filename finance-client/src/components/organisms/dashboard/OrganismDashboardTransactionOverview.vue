<template>
  <div class="transaction-overview q-mt-md">
    <Table
      :data="Object(transactionsWithAccountName)"
      :title="'Transaction Overview'"
      :columns="transactionColumn"
      :actions="['update', 'delete']"
      @update="emit(deleteTransaction, $event)"
      @delete="onDelete"
      @row-click="viewDetailedUser"
    />
  </div>
</template>

<script setup>
import { Table } from 'src/components/molecules'
import { computed } from 'vue'

const props = defineProps({
  data: Object,
})

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

const emit = defineEmits(['deleteTransaction'])
const onDelete = (row) => {
  emit('deleteTransaction', row) // передаём данные строки родителю
}
</script>

<style></style>
