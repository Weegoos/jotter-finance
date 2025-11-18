import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const statsApiStore = defineStore('stats-api', {
  state: () => ({
    goal: null,
    payment: null,
  }),
  actions: {
    async getTotalBalance($q) {
      try {
        this.goal = await getMethod(financeServerURL, 'stats/goal_progress', $q)
      } catch (error) {
        console.error(error)
      }
    },

    async getPaymentTypes($q) {
      try {
        this.payment = await getMethod(financeServerURL, 'stats/payment_types', $q)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
