import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const budgetApiStore = defineStore('budget-api', {
  state: () => ({
    budget: null,
    stats: null,
  }),
  actions: {
    async getAllBudget($q) {
      try {
        this.budget = await getMethod(financeServerURL, 'budget', $q)
      } catch (error) {
        console.error(error)
      }
    },

    async getStats($q) {
      try {
        this.stats = await getMethod(financeServerURL, 'budget/stats', $q)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
