import request from './request'

export interface AccountListParams {
  phone?: string
  status?: string | string[]
  plan_type?: string | string[]
  created_time_start?: string
  created_time_end?: string
  is_paid?: boolean
  page?: number
  page_size?: number
}

export interface AccountItem {
  id: number
  phone: string
  nickname: string
  avatar?: string
  status: string
  plan_type: string
  subscription_end_time?: string
  last_login_time?: string
  created_time: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export interface AccountDetail {
  id: number
  phone: string
  nickname: string
  avatar?: string
  status: string
  created_time: string
  last_login_time?: string
  // 当前订阅
  subscription?: {
    plan_type: string
    start_time: string
    end_time: string
    status: string
    daily_dial_limit: number
    customer_limit: number
    sync_mode: string
  }
  // 最近同步信息
  sync_info?: {
    synced_time: string
    data_size: number
    content_hash: string
  }
}

export interface BanParams {
  reason: string
}

export interface GrantParams {
  plan_type: string
  days: number
  reason: string
}

export interface ResetPasswordResponse {
  temp_password: string
}

export const accountApi = {
  getList: (params: AccountListParams): Promise<PageResult<AccountItem>> =>
    request.get('/admin/accounts', { params }),

  getDetail: (id: number): Promise<AccountDetail> => request.get(`/admin/accounts/${id}`),

  ban: (id: number, data: BanParams): Promise<void> =>
    request.post(`/admin/accounts/${id}/ban`, data),

  unban: (id: number): Promise<void> => request.post(`/admin/accounts/${id}/unban`),

  grant: (id: number, data: GrantParams): Promise<void> =>
    request.post(`/admin/accounts/${id}/grant`, data),

  resetPassword: (id: number): Promise<ResetPasswordResponse> =>
    request.post(`/admin/accounts/${id}/reset-password`),
}
