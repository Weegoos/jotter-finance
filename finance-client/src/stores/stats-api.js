import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const statsApiStore = defineStore('stats-api', {
  state: () => ({
    total_balance: null,
  }),
  actions: {
    async getTotalBalance($q) {
      try {
        this.total_balance = await getMethod(financeServerURL, 'stats/total_balance', $q)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
