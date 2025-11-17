<template>
  <section>
    <div class="grid grid-cols-[70%_30%] gap-2 q-pa-md items-center">
      <div class="grid grid-cols-3 gap-4 items-center">
        <q-card
          :class="item.status === 'active' ? 'activeClass' : 'inactiveClass'"
          v-for="(item, index) in props.data"
          :key="index"
          class="cursor-pointer h-[175px]"
        >
          <q-card-section>
            <div class="grid grid-cols-2">
              <p>Category: {{ item.categories.name }}</p>
              <div class="text-capitalize justify-end grid">
                <span class="p-[4px] statusText">{{ item.status }}</span>
              </div>
            </div>
            <div class="text-subtitle1">{{ item.amount }}$</div>
            <div class="text-subtitle2">Period: {{ item.period }}</div>
          </q-card-section>
          <q-card-actions align="right" class="flex items-end">
            <Button
              color="orange"
              flat
              icon="mdi-pencil"
              @emit-click="openBudget(item)"
            />
            <Button
              color="red"
              flat
              icon="mdi-delete"
              @emit-click="emit('deleteBudget', item)"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="grid justify-end">
        <PieChart :series-data="props.stats"></PieChart>
      </div>
    </div>
    <div class="q-ma-md grid grid-cols-2">
      <div class="grid justify-end">
        <Button
          class="text-black grid justify-end"
          icon="mdi-plus"
          @click="isCreateBudget = true"
        ></Button>
      </div>
      <Dialog :modelValue="isCreateBudget">
        <template #content>
          <Close
            :section-name="'Create budget'"
            @emit-click="isCreateBudget = false"
          ></Close>
          <Input
            class="q-mb-sm"
            label="Amount"
            type="number"
            v-model="createBudgetAmount"
          ></Input>
          <Select
            class="q-mb-sm"
            :options="categoryOptions"
            v-model="createBudgetCategory"
            option-label="name"
            option-value="value"
            label="Category"
          ></Select>
          <Select
            class="q-mb-sm"
            :options="['active', 'inactive']"
            v-model="createBudgetStatus"
            label="Status"
          ></Select>
          <q-date v-model="createBudgetDate" landscape />
        </template>
        <template #actions>
          <Button
            @emit-click="createBudget"
            :label="'Создать'"
            class="text-black"
          ></Button>
        </template>
      </Dialog>
      <Dialog :modelValue="isEditBudget">
        <template #content>
          <Close :section-name="'Edit budget'" @emit-click="isEditBudget = false"></Close>
          <Input
            class="q-mb-sm"
            label="Amount"
            type="number"
            v-model="editBudgetAmount"
          ></Input>
          <Select
            class="q-mb-sm"
            v-model="editBudgetCategory"
            option-label="name"
            option-value="value"
            label="Category"
          ></Select>
          <Select
            class="q-mb-sm"
            :options="['active', 'inactive']"
            v-model="editBudgetStatus"
            label="Status"
          ></Select>
          <q-date v-model="editBudgetDate" landscape />
        </template>
        <template #actions>
          <Button :label="'Edit'" class="text-black" @emit-click="editBudget"></Button>
        </template>
      </Dialog>
    </div>
  </section>
</template>

<script setup>
import { Button, Input, Select } from "src/components/atoms";
import { Close, Dialog, PieChart } from "src/components/molecules";
import { ref, watch } from "vue";
const props = defineProps({
  data: Object,
  categories: Object,
  stats: {
    type: Object,
    default: () => ({ array: [] }),
  },
});

const emit = defineEmits(["deleteBudget", "createBudget", "editBudget"]);
const isCreateBudget = ref(false);
const isEditBudget = ref(false);

const createBudgetAmount = ref("");
const createBudgetCategory = ref(null);
const createBudgetStatus = ref(null);
const categoryOptions = ref([]);

watch(
  () => props.categories,
  (newVal) => {
    categoryOptions.value = newVal.map((t) => ({
      name: t.name,
      value: t.id,
    }));
  }
);

watch(
  () => props.stats,
  (val) => {
    console.log(val);
  }
);

let createBudgetDate = ref("");
const createBudget = () => {
  const d = new Date(createBudgetDate.value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const correct_date = `${year}-${month}`;

  const payload = {
    category_id: createBudgetCategory.value.value,
    amount: Number(createBudgetAmount.value),
    period: correct_date,
    status: createBudgetStatus.value,
  };

  emit("createBudget", payload);
};

const editBudgetAmount = ref("");
const editBudgetCategory = ref(null);
const editBudgetStatus = ref(null);
let editBudgetDate = ref("");
const selectedBudget = ref(null);
const openBudget = (item) => {
  selectedBudget.value = item;
  isEditBudget.value = true;
  editBudgetStatus.value = item.status;
  editBudgetAmount.value = item.amount;
  editBudgetCategory.value = item.categories.name;
  // editBudgetDate.value = item.date;
};

const editBudget = () => {
  const d = new Date(editBudgetDate.value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const correct_date = `${year}-${month}`;

  const payload = {
    category_id: selectedBudget.value.categories.id,
    amount: Number(editBudgetAmount.value),
    period: correct_date,
    status: editBudgetStatus.value,
  };
  emit("editBudget", payload, selectedBudget.value.id);
};
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
