import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const useProjectApiStore = defineStore('project-api', {
  state: () => ({
    project: null,
  }),
  actions: {
    async getAllProjects($q) {
      try {
        this.project = await getMethod(financeServerURL, 'project', $q)
        return this.project
      } catch (error) {
        console.error(error)
      }
    },
    async getAllProjectById($q, id) {
      try {
        this.project = await getMethod(financeServerURL, `project/${id}`, $q)
        return this.project
      } catch (error) {
        console.error(error)
      }
    },
  },
})
