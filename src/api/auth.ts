import request from './request'

export interface LoginParams {
  username: string
  password: string
  captcha: string
  captchaKey: string
}

export interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  admin: {
    id: number
    username: string
    role: string
  }
}

export interface CaptchaResponse {
  captchaKey: string
  imageBase64: string
}

export interface AdminProfile {
  id: number
  username: string
  role: string
  lastLoginTime: string
}

export const authApi = {
  login: (data: LoginParams): Promise<LoginResponse> =>
    request.post('/auth/login', data),

  refresh: (refreshToken: string): Promise<LoginResponse> =>
    request.post('/auth/refresh', { refreshToken }),

  logout: (): Promise<void> => request.post('/auth/logout'),

  getCaptcha: (): Promise<CaptchaResponse> => request.get('/auth/captcha'),

  getProfile: (): Promise<AdminProfile> => request.get('/auth/me'),
}
