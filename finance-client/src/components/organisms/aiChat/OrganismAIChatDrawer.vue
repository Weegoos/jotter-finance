<template>
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
        icon="mdi-note-plus"
        label="Новый чат"
        class="w-full justify-start"
        @click="createChat"
      />
    </div>

    <div class="q-mb-md flex-none">
      <q-list>
        <q-expansion-item expand-separator label="Проекты" default-opened>
          <Button
            flat
            dense
            icon="mdi-folder-plus"
            label="Новый проект"
            class="w-full justify-start"
            @click="openModalWindow"
          />
          <q-item
            clickable
            v-ripple
            v-for="project in props.projects"
            :key="project.id"
            @click="openProject(project.id)"
          >
            <q-item-section avatar>
              <q-icon
                :name="
                  project.type === 'finance'
                    ? 'mdi-currency-usd'
                    : project.type === 'promocodes'
                      ? 'mdi-tag-multiple'
                      : 'mdi-folder'
                "
                :style="{
                  color:
                    project.type === 'finance'
                      ? '#18A13C'
                      : project.type === 'promocodes'
                        ? '#FF9800'
                        : '#607D8B',
                }"
              />
            </q-item-section>
            <q-item-section>
              <p>{{ project.title }}</p>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </div>

    <div class="flex-1 overflow-y-auto">
      <q-list>
        <q-expansion-item expand-separator label="Ваши чаты" default-opened>
          <q-item
            clickable
            v-ripple
            v-for="topic in props.topics.filter((t) => !t.project_id)"
            :key="topic.id"
            @click="openChat(topic.id)"
          >
            <q-item-section avatar>
              <q-icon name="mdi-database" />
            </q-item-section>
            <q-item-section>{{ topic.title }}</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </div>
  </q-drawer>
</template>

<script setup>
import { Button } from 'src/components/atoms'
import { ref } from 'vue'
const props = defineProps({
  topics: Object,
  projects: Object,
})
const drawerLeft = ref(true)

const emit = defineEmits(['openChat', 'createChat', 'openModalWindow', 'openProject'])
const openChat = async (id) => {
  emit('openChat', id)
}

const createChat = async () => {
  emit('createChat')
}

const openModalWindow = async () => {
  emit('openModalWindow')
}

const openProject = async (id) => {
  emit('openProject', id)
}
</script>

<style></style>
