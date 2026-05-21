import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '@/utils/auth'

// 全局响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const BASE_URL = `${import.meta.env.VITE_API_BASE || ''}/api/v1`

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- 401 自动刷新相关状态 ---
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

async function refreshTokenRequest(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  // 直接用 axios 原始请求，绕过拦截器
  const res = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
    `${BASE_URL}/admin/auth/refresh`,
    { refresh_token: refreshToken },
  )
  const { access_token, refresh_token } = res.data.data
  setAccessToken(access_token)
  setRefreshToken(refresh_token)
  return access_token
}

function redirectToLogin() {
  clearTokens()
  const redirect = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/login?redirect=${redirect}`
}

// --- 请求拦截器 ---
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// --- 响应拦截器 ---
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code === 0) {
      return res.data as never
    }
    // 业务错误（非 401）：向上抛，让调用方处理特定错误码
    const error = new Error(res.message || '请求失败') as Error & { code?: number }
    error.code = res.code
    // 通用错误提示（特殊错误码由调用方自己处理）
    if (res.code !== 1001 && res.code !== 1002 && res.code !== 1003 && res.code !== 1004) {
      ElMessage.error(res.message || '操作失败')
    }
    return Promise.reject(error)
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // 网络错误
    if (!error.response) {
      ElMessage.error('网络异常，请稍后重试')
      return Promise.reject(error)
    }

    // 401：Token 过期，尝试刷新
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 并发请求合并到同一刷新 Promise
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
          } else {
            originalRequest.headers = { Authorization: `Bearer ${token}` }
          }
          return request(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshTokenRequest()
        processQueue(null, newToken)
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        } else {
          originalRequest.headers = { Authorization: `Bearer ${newToken}` }
        }
        return request(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 403 权限不足
    if (error.response.status === 403) {
      ElMessage.error('无权限执行此操作')
    }

    return Promise.reject(error)
  },
)

export default request
