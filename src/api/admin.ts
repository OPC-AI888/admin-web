import request from './request'

export interface AdminItem {
  id: number
  username: string
  role: string
  status: string
  lastLoginTime?: string
  createdTime: string
}

export interface AdminCreateParams {
  username: string
  password: string
  role: string
}

export interface AdminUpdateParams {
  role?: string
  status?: string
}

export interface ResetPasswordResponse {
  tempPassword: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const adminApi = {
  getList: (params?: { page?: number; pageSize?: number }): Promise<PageResult<AdminItem>> =>
    request.get('/admins', { params }),

  create: (data: AdminCreateParams): Promise<AdminItem> =>
    request.post('/admins', data),

  update: (id: number, data: AdminUpdateParams): Promise<void> =>
    request.put(`/admins/${id}`, data),

  resetPassword: (id: number): Promise<ResetPasswordResponse> =>
    request.post(`/admins/${id}/reset-password`),
}
