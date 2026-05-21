import request from './request'

export interface LoginParams {
  username: string
  password: string
  captcha: string
  captcha_key: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  admin: {
    id: number
    username: string
    role: string
  }
}

export interface CaptchaResponse {
  captcha_key: string
  image_base64: string
}

export interface AdminProfile {
  id: number
  username: string
  role: string
  last_login_time: string
}

export const authApi = {
  login: (data: LoginParams): Promise<LoginResponse> => request.post('/admin/auth/login', data),

  refresh: (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> =>
    request.post('/admin/auth/refresh', { refresh_token: refreshToken }),

  logout: (): Promise<void> => request.post('/admin/auth/logout'),

  getCaptcha: (): Promise<CaptchaResponse> => request.get('/admin/auth/captcha'),

  getProfile: (): Promise<AdminProfile> => request.get('/admin/auth/me'),
}
