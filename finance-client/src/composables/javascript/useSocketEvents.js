import { onMounted, onBeforeUnmount, ref } from 'vue'
import socket from 'src/services/socket'
import { getMethod } from '../api-method/get'
import { financeServerURL } from 'src/boot/config'

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

export function useTotalBalance($q) {
  const totalBalance = ref(0)

  // Получаем текущее значение с сервера
  const fetchTotalBalance = async () => {
    try {
      const data = await getMethod(financeServerURL, 'stats/total_balance', $q)

      if (data && typeof data.total_balance !== 'undefined') {
        totalBalance.value = data.total_balance

      } else {
        console.warn('⚠️ Сервер не вернул total_balance:', data)
      }
    } catch (error) {
      console.error('❌ Ошибка при получении total balance:', error)
    }
  }

  // Обновляем в реальном времени при событии от WebSocket
  const handleBalanceUpdate = (payload) => {
    if (payload?.total_balance !== undefined) {
      totalBalance.value = payload.total_balance
    }
  }

  onMounted(() => {
    fetchTotalBalance()
    socket.on('balance_update', handleBalanceUpdate)
  })

onBeforeUnmount(() => {
  socket.off('balance_update', handleBalanceUpdate)
})

  return { totalBalance, fetchTotalBalance }
}
