import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const conversationApiStore = defineStore('conversation-api', {
  state: () => ({
    conversation: null,
    conversationByProjectID: null,
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

    async getAllConversationsByProjectID($q, id) {
      try {
        this.conversationByProjectID = await getMethod(financeServerURL, `conversation/${id}`, $q)
        return this.conversationByProjectID
      } catch (error) {
        console.error(error)
      }
    },
  },
})
