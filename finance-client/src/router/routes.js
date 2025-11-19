const routes = [
  {
    path: '/',
    component: () => import('pages/IndexPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('pages/DashBoardPage.vue')
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
