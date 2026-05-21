import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AdminRole } from '@/constants/enums'

export interface MenuItem {
  key: string
  label: string
  icon: string
  path: string
  children?: MenuItem[]
  role?: string
}

const ALL_MENUS: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表板',
    icon: 'DataAnalysis',
    path: '/dashboard',
  },
  {
    key: 'accounts',
    label: '用户管理',
    icon: 'User',
    path: '/accounts',
  },
  {
    key: 'orders',
    label: '订单管理',
    icon: 'ShoppingCart',
    path: '/orders',
  },
  {
    key: 'plans',
    label: '套餐配置',
    icon: 'List',
    path: '/plans',
  },
  {
    key: 'payments',
    label: '支付管理',
    icon: 'CreditCard',
    path: '',
    children: [
      {
        key: 'payments-transactions',
        label: '交易流水',
        icon: 'Document',
        path: '/payments/transactions',
      },
      {
        key: 'payments-reconciliation',
        label: '对账管理',
        icon: 'Calendar',
        path: '/payments/reconciliation',
      },
    ],
  },
  {
    key: 'sync',
    label: '同步监控',
    icon: 'Refresh',
    path: '/sync',
  },
  {
    key: 'stats',
    label: '使用统计',
    icon: 'TrendCharts',
    path: '/stats',
  },
  {
    key: 'content',
    label: '内容管理',
    icon: 'Notebook',
    path: '',
    children: [
      {
        key: 'content-app-versions',
        label: 'App 版本',
        icon: 'PhoneFilled',
        path: '/content/app-versions',
      },
      {
        key: 'content-notices',
        label: '系统公告',
        icon: 'BellFilled',
        path: '/content/notices',
      },
    ],
  },
  {
    key: 'admins',
    label: '管理员',
    icon: 'UserFilled',
    path: '/admins',
    role: AdminRole.SUPER_ADMIN,
  },
]

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<MenuItem[]>([])

  function buildMenus(role: string) {
    menus.value = ALL_MENUS.filter((item) => {
      if (item.role && item.role !== role) return false
      return true
    })
  }

  const activeMenu = computed(() => {
    // 根据当前路由返回激活的菜单 key
    return ''
  })

  return { menus, buildMenus, activeMenu }
})
