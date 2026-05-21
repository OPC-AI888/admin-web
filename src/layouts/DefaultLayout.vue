<template>
  <div class="layout-container" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="layout-sidebar">
      <div class="sidebar-logo">
        <el-icon class="logo-icon"><DataAnalysis /></el-icon>
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">电销效率助手</span>
      </div>

      <el-menu
        :collapse="appStore.sidebarCollapsed"
        :default-active="activeMenuPath"
        class="sidebar-menu"
        router
        background-color="#001529"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#1890ff"
      >
        <template v-for="item in menuStore.menus" :key="item.key">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="item.children?.length" :index="item.key">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.key"
              :index="child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.label }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 顶栏 -->
      <header class="layout-header">
        <div class="header-left">
          <el-button
            class="collapse-btn"
            :icon="appStore.sidebarCollapsed ? Expand : Fold"
            text
            size="large"
            @click="appStore.toggleSidebar"
          />
          <!-- 面包屑 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 管理员信息下拉 -->
          <el-dropdown @command="handleDropdown">
            <div class="admin-info">
              <el-avatar :size="32" class="admin-avatar">
                {{ authStore.admin?.username?.slice(0, 1)?.toUpperCase() }}
              </el-avatar>
              <span class="admin-name">{{ authStore.admin?.username }}</span>
              <el-tag
                :type="authStore.isSuperAdmin ? 'danger' : 'primary'"
                size="small"
                class="admin-role"
              >
                {{ authStore.isSuperAdmin ? '超管' : '运营' }}
              </el-tag>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 个人信息
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const menuStore = useMenuStore()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

// 当前激活菜单路径
const activeMenuPath = computed(() => route.path)

// 当前页面标题
const currentTitle = computed(() => route.meta?.title as string | undefined)

// 初始化菜单
if (menuStore.menus.length === 0 && authStore.admin?.role) {
  menuStore.buildMenus(authStore.admin.role)
}

async function handleDropdown(command: string) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确认退出登录？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
      })
      await authStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  } else if (command === 'profile') {
    ElMessage.info('个人信息功能即将上线')
  }
}
</script>

<style lang="scss" scoped>
$sidebar-width: 220px;
$sidebar-collapsed-width: 64px;
$header-height: 56px;
$sidebar-bg: #001529;

.layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

// 侧边栏
.layout-sidebar {
  width: $sidebar-width;
  height: 100vh;
  background: $sidebar-bg;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow: hidden;
  z-index: 100;
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  white-space: nowrap;

  .logo-icon {
    font-size: 24px;
    color: #1890ff;
    flex-shrink: 0;
  }

  .logo-text {
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    margin-left: 10px;
    white-space: nowrap;
    overflow: hidden;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
  overflow-x: hidden;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    &:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    &.is-active {
      background-color: #1890ff !important;
      color: #fff !important;
    }
  }

  :deep(.el-sub-menu.is-active .el-sub-menu__title) {
    color: #1890ff !important;
  }
}

// 折叠状态
.layout-container.sidebar-collapsed {
  .layout-sidebar {
    width: $sidebar-collapsed-width;
  }
}

// 主内容区
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

// 顶栏
.layout-header {
  height: $header-height;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 0 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .collapse-btn {
    color: #595959;
    font-size: 20px;
    padding: 4px 8px;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background: #f5f5f5;
  }

  .admin-avatar {
    background: #1890ff;
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }

  .admin-name {
    font-size: 14px;
    color: #262626;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-role {
    flex-shrink: 0;
  }

  .dropdown-arrow {
    color: #8c8c8c;
    font-size: 12px;
  }
}

// 页面内容
.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
