import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

export function setupGuards(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    const menuStore = useMenuStore()

    // 公开页面直接放行
    if (to.meta.public) {
      // 已登录访问登录页 → 跳转仪表板
      if (auth.isLoggedIn && to.path === '/login') {
        return { path: '/dashboard' }
      }
      return true
    }

    // 未登录 → 跳转登录页（携带 redirect 参数）
    if (!auth.accessToken) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    if (!auth.admin) {
      try {
        await auth.fetchProfile()
      } catch {
        auth.clearSession()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    // 构建菜单（第一次进入时）
    if (menuStore.menus.length === 0 && auth.admin?.role) {
      menuStore.buildMenus(auth.admin.role)
    }

    // 角色守卫
    if (to.meta.role && to.meta.role !== auth.admin?.role) {
      ElMessage.error('无权限访问该页面')
      return { path: '/dashboard' }
    }

    return true
  })
}
