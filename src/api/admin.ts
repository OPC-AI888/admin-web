import request from './request'

export interface AdminItem {
  id: number
  username: string
  role: string
  status: string
  last_login_time?: string
  created_time: string
}

export interface AdminCreateParams {
  username: string
  password: string
  role: string
  status: string
}

export interface AdminUpdateParams {
  username?: string
  role?: string
  status?: string
}

export interface ResetPasswordResponse {
  temp_password: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const adminApi = {
  getList: (params?: { page?: number; page_size?: number }): Promise<PageResult<AdminItem>> =>
    request.get('/admin/admins', { params }),

  getDetail: (id: number): Promise<AdminItem> => request.get(`/admin/admins/${id}`),

  create: (data: AdminCreateParams): Promise<AdminItem> =>
    request.post('/admin/admins', data),

  update: (id: number, data: AdminUpdateParams): Promise<void> =>
    request.put(`/admin/admins/${id}`, data),

  resetPassword: (id: number): Promise<ResetPasswordResponse> =>
    request.post(`/admin/admins/${id}/reset-password`),

  delete: (id: number): Promise<void> =>
    request.delete(`/admin/admins/${id}`),
}
