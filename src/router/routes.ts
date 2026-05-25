import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/route'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/layouts/BlankLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        name: ROUTE_NAMES.LOGIN,
        component: () => import('@/views/login/Index.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: ROUTE_NAMES.DASHBOARD,
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '仪表板' },
      },
      {
        path: 'accounts',
        name: ROUTE_NAMES.ACCOUNT_LIST,
        component: () => import('@/views/account/List.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'accounts/:id',
        name: ROUTE_NAMES.ACCOUNT_DETAIL,
        component: () => import('@/views/account/Detail.vue'),
        meta: { title: '用户详情' },
      },
      {
        path: 'orders',
        name: ROUTE_NAMES.ORDER_LIST,
        component: () => import('@/views/order/List.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'orders/:id',
        name: ROUTE_NAMES.ORDER_DETAIL,
        component: () => import('@/views/order/Detail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'plans',
        name: ROUTE_NAMES.PLAN_LIST,
        component: () => import('@/views/plan/List.vue'),
        meta: { title: '套餐配置' },
      },
      {
        path: 'plans/:id/edit',
        name: ROUTE_NAMES.PLAN_EDIT,
        component: () => import('@/views/plan/Edit.vue'),
        meta: { title: '编辑套餐', role: 'SUPER_ADMIN' },
      },
      {
        path: 'payments/transactions',
        name: ROUTE_NAMES.PAYMENT_TRANSACTIONS,
        component: () => import('@/views/payment/Transactions.vue'),
        meta: { title: '交易流水' },
      },
      {
        path: 'payments/reconciliation',
        name: ROUTE_NAMES.PAYMENT_RECONCILIATION,
        component: () => import('@/views/payment/Reconciliation.vue'),
        meta: { title: '对账管理' },
      },
      {
        path: 'sync',
        name: ROUTE_NAMES.SYNC,
        component: () => import('@/views/sync/Index.vue'),
        meta: { title: '同步监控' },
      },
      {
        path: 'stats',
        name: ROUTE_NAMES.STATS,
        component: () => import('@/views/stats/Index.vue'),
        meta: { title: '使用统计' },
      },
      {
        path: 'content/app-versions',
        name: ROUTE_NAMES.CONTENT_APP_VERSIONS,
        component: () => import('@/views/content/app-version/List.vue'),
        meta: { title: 'App 版本' },
      },
      {
        path: 'content/notices',
        name: ROUTE_NAMES.CONTENT_NOTICES,
        component: () => import('@/views/content/notice/List.vue'),
        meta: { title: '系统公告' },
      },
      {
        path: 'admins',
        name: ROUTE_NAMES.ADMIN_LIST,
        component: () => import('@/views/admin/List.vue'),
        meta: { title: '管理员管理', role: 'SUPER_ADMIN' },
      },
    ],
  },
  {
    path: '/403',
    component: () => import('@/layouts/BlankLayout.vue'),
    meta: { public: true },
    children: [{ path: '', name: ROUTE_NAMES.ERROR_403, component: () => import('@/views/error/403.vue') }],
  },
  {
    path: '/500',
    component: () => import('@/layouts/BlankLayout.vue'),
    meta: { public: true },
    children: [{ path: '', name: ROUTE_NAMES.ERROR_500, component: () => import('@/views/error/500.vue') }],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/layouts/BlankLayout.vue'),
    meta: { public: true },
    children: [{ path: '', name: ROUTE_NAMES.ERROR_404, component: () => import('@/views/error/404.vue') }],
  },
]

export default routes
