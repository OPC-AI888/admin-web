import { AdminRole } from '@/constants/enums'

/**
 * 判断当前角色是否为超级管理员
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === AdminRole.SUPER_ADMIN
}

/**
 * 判断当前角色是否有权访问某角色限制的路由
 */
export function hasRole(userRole: string | null | undefined, requiredRole: string): boolean {
  if (!userRole) return false
  if (requiredRole === AdminRole.SUPER_ADMIN) {
    return userRole === AdminRole.SUPER_ADMIN
  }
  // OPERATOR 可访问无特殊角色要求的路由
  return true
}

/**
 * 判断是否有权执行某个操作
 */
export function canDo(userRole: string | null | undefined, requiredRole?: string): boolean {
  if (!requiredRole) return true
  return hasRole(userRole, requiredRole)
}
