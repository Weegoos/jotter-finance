import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const categoryApiStore = defineStore('category-api', {
  state: () => ({
    category: null,
  }),
  actions: {
    async getAllCategory($q) {
      try {
        this.category = await getMethod(financeServerURL, 'categories', $q)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
