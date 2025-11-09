<template>
  <q-table
    bordered
    :title="props.title"
    :rows="props.data.data"
    :columns="props.columns"
    row-key="id"
    v-if="props.data?.data?.length"
    :rows-per-page-options="[Math.floor(props.data.totalCount / 2), props.data.totalCount]"
  >
    <template v-for="col in props.columns" :key="col.name" v-slot:[`body-cell-${col.name}`]="scope">
      <q-td :props="scope">
        <div
          v-if="col.html"
          v-html="scope.row[col.field]"
          class="max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis"
        ></div>
        <div v-else>
          {{ scope.row[col.field] }}
        </div>
      </q-td>
    </template>

    <!-- Опциональный слот Actions -->
    <template v-if="props.actions.length" v-slot:body-cell-actions="scope">
      <q-td align="center">
        <q-btn-dropdown @click.stop color="primary">
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup v-if="props.actions.includes('update')">
              <q-item-section>
                <Button
                  class="bg-blue-500 hover:bg-blue-600 text-white"
                  icon="mdi-pencil"
                  size="sm"
                  @click="emit('update', scope.row)"
                />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>
                <Button
                  class="bg-rose-500 hover:bg-rose-600 text-white"
                  icon="mdi-delete"
                  size="sm"
                  @click="emit('delete', scope.row)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { Button } from '../atoms'

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  title: String,
  actions: { type: Array, default: () => [] },
})

// Emits
const emit = defineEmits(['pin', 'update', 'delete', 'page-change', 'rows-per-page-change'])
</script>
