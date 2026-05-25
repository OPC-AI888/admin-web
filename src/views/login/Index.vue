<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-bg-shape shape-1" />
      <div class="login-bg-shape shape-2" />
    </div>

    <div class="login-card">
      <!-- 头部 Logo -->
      <div class="login-header">
        <div class="login-logo">
          <el-icon class="logo-icon-lg"><DataAnalysis /></el-icon>
        </div>
        <h1 class="login-title">电销效率助手</h1>
        <p class="login-subtitle">运营管理后台</p>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="false"
        class="login-alert"
      />

      <!-- 登录表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            clearable
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-row">
            <el-input
              v-model="form.captcha"
              placeholder="请输入验证码"
              size="large"
              :class="{ 'captcha-shake': captchaShake }"
              maxlength="4"
              clearable
            />
            <div class="captcha-img-wrap" @click="loadCaptcha">
              <img
                v-if="captchaImg"
                :src="captchaImg"
                alt="验证码"
                class="captcha-img"
              />
              <div v-else class="captcha-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Loading } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const menuStore = useMenuStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMsg = ref('')
const captchaImg = ref('')
const captchaKey = ref('')
const captchaShake = ref(false)

const form = reactive({
  username: '',
  password: '',
  captcha: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 32, message: '用户名长度 4-32 位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名仅支持字母、数字、下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度 6-32 位', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为4位', trigger: 'blur' },
  ],
}

async function loadCaptcha() {
  captchaImg.value = ''
  try {
    const res = await authApi.getCaptcha()
    captchaKey.value = res.captchaKey
    captchaImg.value = `data:image/png;base64,${res.imageBase64}`
  } catch {
    // 静默失败
  }
}

function shakeCaptcha() {
  captchaShake.value = true
  form.captcha = ''
  setTimeout(() => { captchaShake.value = false }, 600)
}

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  errorMsg.value = ''

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
      captcha: form.captcha,
      captchaKey: captchaKey.value,
    })

    // 构建菜单
    if (authStore.admin?.role) {
      menuStore.buildMenus(authStore.admin.role)
    }

    // 跳转
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (err: unknown) {
    const error = err as Error & { code?: number }
    const code = error.code

    if (code === 1001) {
      errorMsg.value = '账号或密码错误，请重新输入'
      await loadCaptcha()
    } else if (code === 1002) {
      errorMsg.value = ''
      shakeCaptcha()
      await loadCaptcha()
    } else if (code === 1003) {
      await ElMessageBox.alert('账号已禁用，请联系超级管理员', '账号异常', {
        type: 'error',
        confirmButtonText: '知道了',
      })
    } else if (code === 1004) {
      errorMsg.value = '账号已被锁定，请 15 分钟后再试'
    } else {
      errorMsg.value = error.message || '登录失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCaptcha()
})
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #002766 50%, #003a8c 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.1);

  &.shape-1 {
    width: 600px;
    height: 600px;
    top: -200px;
    left: -200px;
  }

  &.shape-2 {
    width: 400px;
    height: 400px;
    bottom: -100px;
    right: -100px;
    background: rgba(24, 144, 255, 0.05);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.4);

  .logo-icon-lg {
    font-size: 36px;
    color: #fff;
  }
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 13px;
  color: #8c8c8c;
}

.login-alert {
  margin-bottom: 16px;
}

.login-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #595959;
    padding-bottom: 4px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
  }
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-img-wrap {
  width: 120px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: border-color 0.2s;

  &:hover {
    border-color: #1890ff;
  }

  .captcha-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .captcha-loading {
    color: #8c8c8c;
    font-size: 20px;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);

  &:hover {
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.5);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

// 验证码抖动动画
.captcha-shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
</style>
