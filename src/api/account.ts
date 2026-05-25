import request from './request'

export interface AccountListParams {
  phone?: string
  status?: string | string[]
  planType?: string | string[]
  createdTimeStart?: string
  createdTimeEnd?: string
  isPaid?: boolean
  page?: number
  pageSize?: number
}

export interface AccountItem {
  id: number
  phone: string
  nickname: string
  avatar?: string
  status: string
  planType: string
  endTime?: string
  lastLoginTime?: string
  createdTime: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface AccountDetail {
  id: number
  phone: string
  nickname: string
  avatar?: string
  status: string
  createdTime: string
  lastLoginTime?: string
  subscription?: {
    planType: string
    startTime: string
    endTime: string
    status: string
    dailyDialLimit: number
    customerLimit: number
    syncMode: string
  }
  syncInfo?: {
    syncedTime: string
    dataSize: number
    contentHashPrefix: string
  }
}

export interface BanParams {
  reason: string
}

export interface GrantParams {
  planType: string
  days: number
  reason: string
}

export interface ResetPasswordResponse {
  tempPassword: string
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function toListParams(params: AccountListParams) {
  return {
    ...params,
    status: firstValue(params.status),
    planType: firstValue(params.planType),
    size: params.pageSize,
    pageSize: undefined,
  }
}

export const accountApi = {
  getList: (params: AccountListParams): Promise<PageResult<AccountItem>> =>
    request.get('/users', { params: toListParams(params) }) as Promise<PageResult<AccountItem>>,

  getDetail: (id: number): Promise<AccountDetail> => request.get(`/users/${id}`),

  ban: (id: number, data: BanParams): Promise<void> =>
    request.put(`/users/${id}/status`, { ...data, status: 'BANNED' }),

  unban: (id: number): Promise<void> => request.put(`/users/${id}/status`, { status: 'ACTIVE' }),

  grant: (id: number, data: GrantParams): Promise<void> =>
    request.post(`/users/${id}/gift`, { planType: data.planType, days: data.days, reason: data.reason }),

  resetPassword: (id: number): Promise<ResetPasswordResponse> =>
    request.post(`/users/${id}/reset-password`),
}
