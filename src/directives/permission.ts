import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * v-permission="'SUPER_ADMIN'"
 * 非 SUPER_ADMIN 则从 DOM 中移除该元素
 */
export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const authStore = useAuthStore()
    const requiredRole = binding.value
    if (!requiredRole) return

    const adminRole = authStore.admin?.role
    if (adminRole !== requiredRole) {
      el.parentNode?.removeChild(el)
    }
  },
}

export default vPermission
