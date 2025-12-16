const routes = [
  {
    path: '/',
    component: () => import('pages/IndexPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('pages/DashBoardPage.vue'),
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegistrationPage.vue'),
  },
  {
    path: '/profile',
    component: () => import('pages/ProfilePage.vue'),
  },
  {
    path: '/settings',
    component: () => import('pages/AppSettings.vue'),
  },
  {
    path: '/accounts',
    component: () => import('pages/AccountsPage.vue'),
  },
  {
    path: '/budget',
    component: () => import('pages/BudgetPage.vue'),
  },
  {
    path: '/chat/:chatId?', // знак вопроса делает параметр необязательным
    component: () => import('pages/AIChatPage.vue'),
  },

  {
    path: '/project/:projectId?/chat/:chatIdByProjectId?', // знак вопроса делает параметр необязательным
    component: () => import('pages/AIChatPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
