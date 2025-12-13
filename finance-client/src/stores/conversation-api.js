import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const conversationApiStore = defineStore('conversation-api', {
  state: () => ({
    conversation: null,
  }),
  actions: {
    async getAllConversation($q) {
      try {
        this.conversation = await getMethod(financeServerURL, 'conversation', $q)
        return this.conversation
      } catch (error) {
        console.error(error)
      }
    },
  },
})
