// 路由名称常量
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  ACCOUNT_LIST: 'AccountList',
  ACCOUNT_DETAIL: 'AccountDetail',
  ORDER_LIST: 'OrderList',
  ORDER_DETAIL: 'OrderDetail',
  PLAN_LIST: 'PlanList',
  PLAN_EDIT: 'PlanEdit',
  PAYMENT_TRANSACTIONS: 'PaymentTransactions',
  PAYMENT_RECONCILIATION: 'PaymentReconciliation',
  SYNC: 'Sync',
  STATS: 'Stats',
  CONTENT_APP_VERSIONS: 'ContentAppVersions',
  CONTENT_NOTICES: 'ContentNotices',
  ADMIN_LIST: 'AdminList',
  ERROR_403: 'Error403',
  ERROR_404: 'Error404',
  ERROR_500: 'Error500',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
