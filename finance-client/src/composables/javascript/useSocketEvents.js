import { onMounted, onBeforeUnmount } from 'vue'
import socket from 'src/services/socket'

export function useSocketEvents(events) {
  onMounted(() => {
    for (const [event, handler] of Object.entries(events)) {
      socket.on(event, handler)
    }
  })

  onBeforeUnmount(() => {
    for (const event of Object.keys(events)) {
      socket.off(event)
    }
  })
}
