import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useQuasar } from 'quasar'
import { useApiStore } from 'src/stores/user-api'
import { userServerURL } from 'src/boot/config'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const store = useApiStore()
    const adminRole = 'admin'
    const $q = useQuasar()

    // Проверяем токен в куках
    const hasToken = document.cookie.includes('access_token')

    // ⚠️ Если токена нет и это НЕ страница логина — редиректим
    if (!hasToken && to.path !== '/login') {
      return next('/login')
    }

    // Если токена нет, но юзер уже на логине — просто продолжаем
    if (!hasToken && to.path === '/login') {
      return next()
    }

    // Загружаем данные пользователя, если их ещё нет
    if (!store.role) {
      try {
        await store.getUserInfo(userServerURL, $q)
      } catch (err) {
        console.error('Error getting user info:', err)
        return next('/login')
      }
    }

    // Если маршрут требует админ-доступ
    if (to.meta.requiresAdmin && store.role !== adminRole) {
      return next('/login')
    }

    // Всё в порядке — разрешаем переход
    next()
  })

  return Router
})
