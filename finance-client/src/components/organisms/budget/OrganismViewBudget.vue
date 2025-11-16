<template>
  <section>
    <div class="row grid-cols-2 gap-2 q-pa-md">
      <div class="col-9 grid grid-cols-3 gap-4">
        <q-card
          :class="item.status === 'active' ? 'activeClass' : 'inactiveClass'"
          v-for="(item, index) in props.data"
          :key="index"
          class="cursor-pointer"
        >
          <q-card-section>
            <div class="grid grid-cols-2">
              <p>Category: {{ item.categories.name }}</p>
              <div class="text-capitalize justify-end grid">
                <span class="bg-white p-[4px] statusText">{{ item.status }}</span>
              </div>
            </div>
            <div class="text-subtitle1">{{ item.amount }}$</div>
            <div class="text-subtitle2">Period: {{ item.period }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <Button color="orange" flat icon="mdi-pencil" />
            <Button color="red" flat icon="mdi-delete" @emit-click="emit('deleteBudget', item)" />
          </q-card-actions>
        </q-card>
      </div>
      <div>Overview Panel</div>
    </div>
    <div class="q-ma-md">
      <div class="grid grid-cols-2">
        <p>Construction Costs List</p>
        <div class="grid justify-end">
          <Button class="text-black" icon="mdi-plus" @click="isCreateBudget = true"></Button>
        </div>
      </div>
      <Dialog :modelValue="isCreateBudget">
        <template #content>
          <Close :section-name="'Create budget'" @emit-click="isCreateBudget = false"></Close>
          <Input label="Amount" v-model="createBudgetAmount"></Input>
          <Select></Select>
        </template>
      </Dialog>
    </div>
  </section>
</template>

<script setup>
import { Button, Input, Select } from 'src/components/atoms'
import { Close, Dialog } from 'src/components/molecules'
import { ref } from 'vue'
const props = defineProps({
  data: Object,
  categories: Object,
})

const emit = defineEmits(['deleteBudget'])
const isCreateBudget = ref(false)
</script>

<style scope>
.activeClass {
  background-color: #b4ed95;
}

.inactiveClass {
  background-color: #cc7e7e;
}

.statusText {
  color: #3d3d3d;
}
</style>
